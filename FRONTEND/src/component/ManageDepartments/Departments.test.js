import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import Departments from './Departments';
import * as deptService from '../../services/departmentService';

jest.mock('../../services/departmentService');
jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
    },
}));

describe('Departments Component (Mock Testing)', () => {
    const mockDepartments = [
        { id: 1, name: 'Phòng Kỹ Thuật', createdAt: '2026-10-10T08:00:00Z' },
        { id: 2, name: 'Phòng Nhân Sự', createdAt: '2026-10-10T08:30:00Z' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        deptService.fetchAllDepartments.mockResolvedValue({
            EC: 0,
            EM: 'OK',
            DT: mockDepartments,
        });
        deptService.createDepartment.mockResolvedValue({
            EC: 0,
            EM: 'Create success',
            DT: { id: 3, name: 'Phòng Marketing' },
        });
        deptService.updateDepartment.mockResolvedValue({
            EC: 0,
            EM: 'Update success',
            DT: { id: 1, name: 'Phòng Kỹ Thuật & AI' },
        });
        deptService.deleteDepartment.mockResolvedValue({
            EC: 0,
            EM: 'Delete success',
            DT: [],
        });
    });

    test('renders department list successfully with mock data', async () => {
        render(<Departments />);

        expect(screen.getByText('Đang tải danh sách phòng ban...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Phòng Kỹ Thuật')).toBeInTheDocument();
            expect(screen.getByText('Phòng Nhân Sự')).toBeInTheDocument();
        });

        // Kiểm tra KPI cards
        expect(screen.getByText('Tổng số phòng ban')).toBeInTheDocument();
        expect(screen.getAllByText('02').length).toBeGreaterThanOrEqual(1);
    });

    test('filters department list by search term', async () => {
        render(<Departments />);

        await waitFor(() => {
            expect(screen.getByText('Phòng Kỹ Thuật')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Tìm theo tên phòng ban...');
        fireEvent.change(searchInput, { target: { value: 'Nhân Sự' } });

        expect(screen.queryByText('Phòng Kỹ Thuật')).not.toBeInTheDocument();
        expect(screen.getByText('Phòng Nhân Sự')).toBeInTheDocument();
    });

    test('opens create department modal on button click', async () => {
        render(<Departments />);

        await waitFor(() => {
            expect(screen.getByText('Phòng Kỹ Thuật')).toBeInTheDocument();
        });

        const addButton = screen.getByRole('button', { name: /Thêm phòng ban/i });
        fireEvent.click(addButton);

        expect(screen.getByText('Thêm phòng ban', { selector: '.modal-title' })).toBeInTheDocument();
    });

    test('opens edit modal and triggers update', async () => {
        render(<Departments />);

        await waitFor(() => {
            expect(screen.getByText('Phòng Kỹ Thuật')).toBeInTheDocument();
        });

        const editButtons = screen.getAllByTitle('Sửa phòng ban');
        fireEvent.click(editButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('Sửa phòng ban', { selector: '.modal-title' })).toBeInTheDocument();
        });

        const nameInput = screen.getByPlaceholderText('VD: Phòng Kỹ thuật & Công nghệ, Phòng Nhân sự...');
        expect(nameInput.value).toBe('Phòng Kỹ Thuật');
    });

    test('opens delete modal and confirms deletion', async () => {
        render(<Departments />);

        await waitFor(() => {
            expect(screen.getByText('Phòng Kỹ Thuật')).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByTitle('Xóa phòng ban');
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('Xác nhận xóa phòng ban')).toBeInTheDocument();
        });

        const modalDialog = screen.getByRole('dialog');
        const confirmDeleteBtn = within(modalDialog).getByRole('button', { name: /Xóa phòng ban/i });
        fireEvent.click(confirmDeleteBtn);

        await waitFor(() => {
            expect(deptService.deleteDepartment).toHaveBeenCalledWith(
                expect.objectContaining({ id: 1, name: 'Phòng Kỹ Thuật' })
            );
        });
    });

    test('renders error state on API failure and retries', async () => {
        deptService.fetchAllDepartments.mockResolvedValueOnce({
            EC: 1,
            EM: 'Lỗi tải cơ sở dữ liệu',
            DT: [],
        });

        render(<Departments />);

        await waitFor(() => {
            expect(screen.getByText('Lỗi tải cơ sở dữ liệu')).toBeInTheDocument();
        });

        const retryBtn = screen.getByRole('button', { name: /Thử lại/i });
        fireEvent.click(retryBtn);

        await waitFor(() => {
            expect(deptService.fetchAllDepartments).toHaveBeenCalledTimes(2);
        });
    });

    test('renders empty state when no departments exist', async () => {
        deptService.fetchAllDepartments.mockResolvedValueOnce({
            EC: 0,
            EM: 'OK',
            DT: [],
        });

        render(<Departments />);

        await waitFor(() => {
            expect(screen.getByText('Chưa có phòng ban nào trong hệ thống.')).toBeInTheDocument();
        });
    });
});
