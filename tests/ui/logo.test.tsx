import React from 'react';
import { render, screen } from '@testing-library/react';
import { Logo } from '../../src/components/logo';

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
  Brain: ({ className, ...props }: any) => (
    <svg data-testid="brain-icon" className={className} {...props} />
  ),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} data-testid="logo-link" {...props}>
      {children}
    </a>
  );
});

describe('Logo Component', () => {
  it('renders with SmartPath text', () => {
    render(<Logo />);
    
    expect(screen.getByText('SmartPath')).toBeInTheDocument();
  });

  it('renders brain icon correctly', () => {
    render(<Logo />);
    
    const icon = screen.getByTestId('brain-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('h-7', 'w-7', 'text-primary');
  });

  it('links to dashboard page', () => {
    render(<Logo />);
    
    const link = screen.getByTestId('logo-link');
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('has proper styling and hover effects', () => {
    render(<Logo />);
    
    const link = screen.getByTestId('logo-link');
    expect(link).toHaveClass('flex', 'items-center', 'gap-2', 'hover:text-primary');
  });

  it('provides accessible link content', () => {
    render(<Logo />);
    
    expect(screen.getByRole('link')).toHaveTextContent('SmartPath');
  });
});