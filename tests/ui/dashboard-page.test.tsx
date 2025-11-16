import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '../../src/app/(app)/dashboard/page';

// Mock Supabase
jest.mock('@/lib/supabaseBrowser', () => ({
  __esModule: true,
  default: {
    auth: {
      getSession: jest.fn(() => 
        Promise.resolve({ 
          data: { 
            session: { user: { id: 'test-user-id' } } 
          }, 
          error: null 
        })
      ),
    },
  },
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock all Lucide icons
jest.mock('lucide-react', () => ({
  ListChecks: ({ className, ...props }: any) => (
    <svg data-testid="list-checks-icon" className={className} {...props} />
  ),
  BookOpen: ({ className, ...props }: any) => (
    <svg data-testid="book-open-icon" className={className} {...props} />
  ),
  PlusCircle: ({ className, ...props }: any) => (
    <svg data-testid="plus-circle-icon" className={className} {...props} />
  ),
  CalendarDays: ({ className, ...props }: any) => (
    <svg data-testid="calendar-days-icon" className={className} {...props} />
  ),
  Wand2: ({ className, ...props }: any) => (
    <svg data-testid="wand2-icon" className={className} {...props} />
  ),
  Calendar: ({ className, ...props }: any) => (
    <svg data-testid="calendar-icon" className={className} {...props} />
  ),
  UploadCloud: ({ className, ...props }: any) => (
    <svg data-testid="upload-cloud-icon" className={className} {...props} />
  ),
  FileQuestion: ({ className, ...props }: any) => (
    <svg data-testid="file-question-icon" className={className} {...props} />
  ),
  ArrowRight: ({ className, ...props }: any) => (
    <svg data-testid="arrow-right-icon" className={className} {...props} />
  ),
  Layers: ({ className, ...props }: any) => (
    <svg data-testid="layers-icon" className={className} {...props} />
  ),
  NotebookPen: ({ className, ...props }: any) => (
    <svg data-testid="notebook-pen-icon" className={className} {...props} />
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
    <div className={className} data-testid="dashboard-card" {...props}>{children}</div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
  CardDescription: ({ children, className, ...props }: any) => (
    <p className={className} {...props}>{children}</p>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <h2 className={className} {...props}>{children}</h2>
  ),
}));

describe('DashboardPage Component', () => {
  it('renders the main dashboard content', async () => {
    render(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Welcome to your Dashboard!')).toBeInTheDocument();
    });
    expect(screen.getByText('Upcoming Tasks')).toBeInTheDocument();
    expect(screen.getByText('Study Sessions')).toBeInTheDocument();
  });

  it('displays sample tasks and study sessions', async () => {
    render(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Complete Math Assignment 2 by Friday')).toBeInTheDocument();
    });
    expect(screen.getByText('Calculus I - Today, 2:00 PM - 4:00 PM')).toBeInTheDocument();
  });

  it('renders feature tiles with navigation links', async () => {
    render(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Add New Course')).toBeInTheDocument();
    });
    expect(screen.getByText('Generate Schedule')).toBeInTheDocument();
    expect(screen.getByText('Generate Flashcards')).toBeInTheDocument();
    
    const addCourseLink = screen.getByRole('link', { name: /add course/i });
    expect(addCourseLink).toHaveAttribute('href', '/add-course');
  });

  it('renders feature icons correctly', async () => {
    render(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('plus-circle-icon')).toBeInTheDocument();
    });
    expect(screen.getByTestId('wand2-icon')).toBeInTheDocument();
    expect(screen.getByTestId('layers-icon')).toBeInTheDocument();
  });

  it('has responsive grid layout', async () => {
    render(<DashboardPage />);
    
    await waitFor(() => {
      const containers = screen.getAllByTestId('dashboard-card');
      expect(containers.length).toBeGreaterThan(0);
    });
    
    // Check that features section exists
    expect(screen.getByText('Features')).toBeInTheDocument();
  });
});