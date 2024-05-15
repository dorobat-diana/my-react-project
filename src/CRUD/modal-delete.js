import React from 'react';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

const DeleteUserModal = ({ open, onClose, onConfirm }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
        <h2 id="modal-title">Delete User</h2>
        <p id="modal-description">Are you sure you want to delete this user?</p>
        <Button onClick={onClose} color="primary" variant="contained">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete
        </Button>
      </Box>
    </Modal>
  );
};

export default DeleteUserModal;
