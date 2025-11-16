import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggleButton } from '../../src/components/theme-toggle-button';

// Mock next-themes
const mockSetTheme = jest.fn();
jest.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
  }),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Sun: ({ className, ...props }: any) => (
    <svg data-testid="sun-icon" className={className} {...props} />
  ),
  Moon: ({ className, ...props }: any) => (
    <svg data-testid="moon-icon" className={className} {...props} />
  ),
}));

// Mock UI components with minimal implementations
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, size, ...props }: any) => (
    <button data-variant={variant} data-size={size} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children, align }: any) => (
    <div data-testid="dropdown-content" data-align={align}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div data-testid="dropdown-item" onClick={onClick} role="menuitem">
      {children}
    </div>
  ),
}));

describe('ThemeToggleButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders theme toggle dropdown', () => {
    render(<ThemeToggleButton />);
    
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
  });

  it('renders sun and moon icons', () => {
    render(<ThemeToggleButton />);
    
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
  });

  it('includes theme options in dropdown', () => {
    render(<ThemeToggleButton />);
    
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('changes theme when options are clicked', () => {
    render(<ThemeToggleButton />);
    
    fireEvent.click(screen.getByText('Light'));
    expect(mockSetTheme).toHaveBeenCalledWith('light');
    
    fireEvent.click(screen.getByText('Dark'));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('has accessible screen reader text', () => {
    render(<ThemeToggleButton />);
    
    expect(screen.getByText('Toggle theme')).toBeInTheDocument();
    expect(screen.getByText('Toggle theme')).toHaveClass('sr-only');
  });
});