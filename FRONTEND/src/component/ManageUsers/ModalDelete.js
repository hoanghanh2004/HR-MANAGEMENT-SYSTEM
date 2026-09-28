import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function ModalDelete(props) {
  return (
    <>
      <Modal show={props.show} onHide={props.handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete user</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure confirm Delete this user: <span style={{color: "red"}}>{props.dataModal.email}</span> !</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={props.confirmDeleteUser}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalDelete;