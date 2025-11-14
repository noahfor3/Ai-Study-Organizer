import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupPage from '../../src/app/signup/page';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Brain: ({ className, ...props }: any) => (
    <svg data-testid="brain-icon" className={className} {...props} />
  ),
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, className, asChild, ...props }: any) => {
    if (asChild) {
      return <div className={className} {...props}>{children}</div>;
    }
    return <button className={className} {...props}>{children}</button>;
  },
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="signup-card" {...props}>{children}</div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
  CardDescription: ({ children, className, ...props }: any) => (
    <p className={className} {...props}>{children}</p>
  ),
  CardFooter: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <h2 className={className} {...props}>{children}</h2>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ className, ...props }: any) => (
    <input className={className} {...props} />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, className, ...props }: any) => (
    <label className={className} {...props}>{children}</label>
  ),
}));

describe('SignupPage Component', () => {
  it('renders the signup page with essential elements', () => {
    render(<SignupPage />);
    
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('SmartPath')).toBeInTheDocument();
    expect(screen.getByTestId('brain-icon')).toBeInTheDocument();
  });

  it('renders all required form fields', () => {
    render(<SignupPage />);
    
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('has correct input types for form fields', () => {
    render(<SignupPage />);
    
    expect(screen.getByLabelText('Username')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText('Confirm Password')).toHaveAttribute('type', 'password');
  });

  it('allows user to fill out the signup form', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);
    
    await user.type(screen.getByLabelText('Username'), 'newuser');
    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'password123');
    
    expect(screen.getByLabelText('Username')).toHaveValue('newuser');
    expect(screen.getByLabelText('Email')).toHaveValue('user@example.com');
  });

  it('renders navigation links correctly', () => {
    render(<SignupPage />);
    
    const loginLink = screen.getByRole('link', { name: /login/i });
    
    expect(loginLink).toHaveAttribute('href', '/');
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
  });
});