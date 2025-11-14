import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../../src/app/page';

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
    <div className={className} data-testid="login-card" {...props}>{children}</div>
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

describe('LoginPage Component', () => {
  it('renders the login page with essential elements', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('SmartPath')).toBeInTheDocument();
    expect(screen.getByTestId('brain-icon')).toBeInTheDocument();
  });

  it('renders username and password form fields', () => {
    render(<LoginPage />);
    
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toHaveAttribute('type', 'email');
    expect(screen.getByPlaceholderText('******')).toHaveAttribute('type', 'password');
  });

  it('allows user input in form fields', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password');
  });

  it('renders navigation links correctly', () => {
    render(<LoginPage />);
    
    const signupLink = screen.getByRole('link', { name: /sign up/i });
    
    expect(signupLink).toHaveAttribute('href', '/signup');
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    expect(emailInput).toHaveAttribute('id', 'identifier');
    expect(passwordInput).toHaveAttribute('id', 'password');
  });
});