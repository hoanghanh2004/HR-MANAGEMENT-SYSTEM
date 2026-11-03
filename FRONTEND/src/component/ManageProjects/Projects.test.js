import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Projects from './Projects';
import * as projectService from '../../services/projectService';

jest.mock('../../services/projectService');
jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
    },
}));

describe('Projects Component (Unit Testing)', () => {
    const mockProjects = [
        {
            id: 1,
            name: 'Hệ thống Quản lý Nhân sự HRMaster',
            description: 'Phần mềm nhân sự doanh nghiệp',
            startDate: '2026-10-01',
            endDate: '2026-12-31',
            status: 'IN_PROGRESS',
            createdAt: '2026-10-01T08:00:00Z',
        },
        {
            id: 2,
            name: 'Cổng thông tin tuyển dụng nội bộ',
            description: 'Tuyển dụng nhân sự tech',
            startDate: '2026-11-01',
            endDate: '2027-01-15',
            status: 'PLANNING',
            createdAt: '2026-10-05T08:30:00Z',
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        projectService.fetchAllProjects.mockResolvedValue({
            EC: 0,
            EM: 'Get projects success',
            DT: mockProjects,
        });
        projectService.createProject.mockResolvedValue({
            EC: 0,
            EM: 'Create project success',
            DT: {
                id: 3,
                name: 'Ứng dụng chấm công di động',
                description: 'Mobile App React Native',
                startDate: '2026-11-10',
                endDate: '2026-12-10',
                status: 'PLANNING',
            },
        });
        projectService.updateProject.mockResolvedValue({
            EC: 0,
            EM: 'Update project success',
            DT: {
                id: 1,
                name: 'Hệ thống Quản lý Nhân sự HRMaster v2',
                status: 'COMPLETED',
            },
        });
        projectService.deleteProject.mockResolvedValue({
            EC: 0,
            EM: 'Delete project success',
            DT: [],
        });
    });

    test('renders project list successfully with mock data and KPI cards', async () => {
        render(<Projects />);

        expect(screen.getByText('Đang tải danh sách dự án...')).toBeInTheDocument();

        await waitFor(() => {
            expect(
                screen.getByText('Hệ thống Quản lý Nhân sự HRMaster')
            ).toBeInTheDocument();
            expect(
                screen.getByText('Cổng thông tin tuyển dụng nội bộ')
            ).toBeInTheDocument();
        });

        // Kiểm tra KPI cards
        expect(screen.getByText('Tổng số dự án')).toBeInTheDocument();
        expect(screen.getAllByText('Đang thực hiện').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Lập kế hoạch').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Đã hoàn thành').length).toBeGreaterThanOrEqual(1);
    });

    test('filters project list by search term', async () => {
        render(<Projects />);

        await waitFor(() => {
            expect(
                screen.getByText('Hệ thống Quản lý Nhân sự HRMaster')
            ).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText(
            'Tìm theo tên dự án, mô tả hoặc mã DA...'
        );
        fireEvent.change(searchInput, { target: { value: 'tuyển dụng' } });

        expect(
            screen.queryByText('Hệ thống Quản lý Nhân sự HRMaster')
        ).not.toBeInTheDocument();
        expect(
            screen.getByText('Cổng thông tin tuyển dụng nội bộ')
        ).toBeInTheDocument();
    });

    test('opens create project modal on button click', async () => {
        render(<Projects />);

        await waitFor(() => {
            expect(
                screen.getByText('Hệ thống Quản lý Nhân sự HRMaster')
            ).toBeInTheDocument();
        });

        const addButton = screen.getByRole('button', { name: /Thêm dự án/i });
        fireEvent.click(addButton);

        expect(
            screen.getByText('Thêm dự án mới', { selector: '.modal-title' })
        ).toBeInTheDocument();
    });

    test('opens edit modal on edit button click', async () => {
        render(<Projects />);

        await waitFor(() => {
            expect(
                screen.getByText('Hệ thống Quản lý Nhân sự HRMaster')
            ).toBeInTheDocument();
        });

        const editButtons = screen.getAllByTitle('Sửa dự án');
        fireEvent.click(editButtons[0]);

        await waitFor(() => {
            expect(
                screen.getByText('Cập nhật dự án', { selector: '.modal-title' })
            ).toBeInTheDocument();
        });
    });

    test('opens delete modal on delete button click', async () => {
        render(<Projects />);

        await waitFor(() => {
            expect(
                screen.getByText('Hệ thống Quản lý Nhân sự HRMaster')
            ).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByTitle('Xóa dự án');
        fireEvent.click(deleteButtons[0]);

        expect(
            screen.getByText('Xác nhận xóa dự án', { selector: '.modal-title' })
        ).toBeInTheDocument();
    });
});
