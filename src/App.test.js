import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import Home from './CRUD/Home';
import DeleteUserModal from './CRUD/modal-delete';
import Create from './CRUD/Create';
import Update from './CRUD/Update';
import View from './CRUD/View';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: '1', // Mocking useParams to provide a valid id for testing
  }),
}));

describe('Home Component', () => {
  test('renders user list correctly', async () => {
    const mockData = [
      { id: 1, name: 'John Doe', email: 'johndoe@example.com', age: '21' },
      { id: 2, name: 'Jane Smith', email: 'janesmith@example.com', age: '40' },
    ];

    axios.get.mockResolvedValueOnce({ data: mockData });

    render(
      <BrowserRouter> {/* Wrap your component with BrowserRouter */}
        <Home />
      </BrowserRouter>
    );

    // Check if user list is rendered
    await waitFor(() => {
      const userList = screen.getByText(/User List/i);
      expect(userList).toBeInTheDocument();
    });

    // Check if user data is rendered
    await waitFor(() => {
      const user1 = screen.getByText('John Doe');
      const user2 = screen.getByText('Jane Smith');
      expect(user1).toBeInTheDocument();
      expect(user2).toBeInTheDocument();
    });
  });
  test('handles delete user', async () => {
    const mockData = [
      { id: 1, name: 'John Doe', email: 'johndoe@example.com', age: '21' },
    ];

    axios.get.mockResolvedValueOnce({ data: mockData });

    render(
      <BrowserRouter> {/* Wrap your component with BrowserRouter */}
        <Home />
      </BrowserRouter>
    );

    // Check if user list is rendered
    await waitFor(() => {
      const userList = screen.getByText(/User List/i);
      expect(userList).toBeInTheDocument();
    });
    await waitFor(() => {
      const user1 = screen.getByText('John Doe');
      
      expect(user1).toBeInTheDocument();
  
    });

    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButtons[0]); // Assuming it's the first delete button
  
    // Check if delete modal is rendered
    await waitFor(() => {
      const modalTitle = screen.getByText('Delete User');
      expect(modalTitle).toBeInTheDocument();
    });
  
    // Click the confirm delete button in the modal
    const confirmDeleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(confirmDeleteButton);
     // Check if the modal is closed after deletion

  

  // Check if user list is updated after deletion
  await waitFor(() => {
    expect(screen.queryByText('John Doe')).toBeNull();
  });
  });
});
describe('View Component', () => {
  test('renders user details correctly', async () => {
    const mockData = {
      id: 1,
      name: 'John Doe',
      email: 'johndoe@example.com',
      age: '21',
    };

    axios.get.mockResolvedValueOnce({ data: mockData });

    render(
      <BrowserRouter>
        <View />
      </BrowserRouter>
    );

    await waitFor(() => {
      const userDetailsTitle = screen.getByText('User Details');
      expect(userDetailsTitle).toBeInTheDocument();
    });

    await waitFor(() => {
      const nameElement = screen.getByText(`Name: ${mockData.name}`);
      const emailElement = screen.getByText(`Email: ${mockData.email}`);
      const ageElement = screen.getByText(`Age: ${mockData.age}`);

      expect(nameElement).toBeInTheDocument();
      expect(emailElement).toBeInTheDocument();
      expect(ageElement).toBeInTheDocument();
    });
  });
});
describe('Create Component', () => {
  test('submits new user form', async () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText('Name:');
    const emailInput = screen.getByLabelText('Email:');
    const ageInput = screen.getByLabelText('Age:');
    const submitButton = screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(ageInput, { target: { value: '30' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3030/users',
        {
          name: 'Test User',
          email: 'test@example.com',
          age: '30',
        }
      );
    });
  });
});
describe('Update Component', () => {
  test('submits updated user form', async () => {
    const mockUserData = {
      id: 1,
      name: 'John Doe',
      email: 'johndoe@example.com',
      age: '21',
    };

    // Mock Axios GET request to fetch user data
    axios.get.mockResolvedValueOnce({ data: mockUserData });

    // Render Update component with mocked data
    render(
      <BrowserRouter>
        <Update />
      </BrowserRouter>
    );

    // Check if the form is pre-filled with user data
    await waitFor(() => {
      const nameInput = screen.getByLabelText('Name:');
      const emailInput = screen.getByLabelText('Email:');
      const ageInput = screen.getByLabelText('Age:');

      expect(nameInput).toHaveValue(mockUserData.name);
      expect(emailInput).toHaveValue(mockUserData.email);
      expect(ageInput).toHaveValue(mockUserData.age);
    });

    // Simulate user updating the form
    const updatedName = 'Updated Name';
    const updatedEmail = 'updated@example.com';
    const updatedage = '22';

    //simulate user updating the form


    const nameInput = screen.getByLabelText('Name:');
    const emailInput = screen.getByLabelText('Email:');
    const ageInput = screen.getByLabelText('Age:');
    const submitButton = screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(nameInput, { target: { value: updatedName } });
    fireEvent.change(emailInput, { target: { value: updatedEmail } });
    fireEvent.change(ageInput, { target: { value: updatedage } });

    fireEvent.click(submitButton);

    // Check if the data appears changed in the table 
    await waitFor(() => {
      expect(screen.queryByText(mockUserData.name)).toBeDefined();   
      expect(screen.queryByText(mockUserData.email)).toBeDefined();
      expect(screen.queryByText(mockUserData.age)).toBeDefined();  
    });
  });
});
