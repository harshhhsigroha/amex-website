import { useState, useMemo } from 'react';
import { 
  Folder, 
  File, 
  Download, 
  Trash2, 
  Upload, 
  Search,
  ChevronRight,
  Calendar,
  Clock,
  FileText,
  FolderOpen,
  ArrowLeft,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useFiles, FileRecord, FileFilters } from '@/hooks/useFiles';
import { useClients } from '@/hooks/useClients';
import { 
  getAvailableFinancialYears, 
  getMonthsForFinancialYear, 
  getWeeksForMonth,
  getDaysForWeek,
  FinancialYearInfo,
  FinancialMonthInfo,
  FinancialWeekInfo,
  FinancialDayInfo,
} from '@/lib/ukFinancialCalendar';
import { FileUploadDialog } from './FileUploadDialog';

interface FileBrowserProps {
  isAdmin?: boolean;
  clientId?: string;
}

type BreadcrumbLevel = 'root' | 'year' | 'month' | 'week' | 'day';

interface BreadcrumbState {
  level: BreadcrumbLevel;
  year?: FinancialYearInfo;
  month?: FinancialMonthInfo;
  week?: FinancialWeekInfo;
  day?: FinancialDayInfo;
}

export function FileBrowser({ isAdmin = false, clientId }: FileBrowserProps) {
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbState>({ level: 'root' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | undefined>(clientId);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileRecord | null>(null);

  const { clients } = useClients();
  const { 
    files, 
    isLoading, 
    filters, 
    setFilters, 
    downloadFile, 
    deleteFile,
    uploadFile,
    refreshFiles,
  } = useFiles(!isAdmin);

  const availableYears = useMemo(() => getAvailableFinancialYears(5), []);

  // Apply search filter
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term) {
      setFilters({ ...filters, searchTerm: term });
    } else {
      const { searchTerm: _, ...rest } = filters;
      setFilters(rest);
    }
  };

  // Apply client filter
  const handleClientChange = (value: string) => {
    const newClientId = value === 'all' ? undefined : value;
    setSelectedClient(newClientId);
    setFilters({ ...filters, clientId: newClientId });
  };

  // Navigation handlers
  const navigateToYear = (year: FinancialYearInfo) => {
    setBreadcrumb({ level: 'year', year });
    setFilters({ ...filters, financialYear: year.label });
  };

  const navigateToMonth = (month: FinancialMonthInfo) => {
    setBreadcrumb({ ...breadcrumb, level: 'month', month });
  };

  const navigateToWeek = (week: FinancialWeekInfo) => {
    setBreadcrumb({ ...breadcrumb, level: 'week', week });
    setFilters({ ...filters, financialWeek: week.weekNumber });
  };

  const navigateToDay = (day: FinancialDayInfo) => {
    setBreadcrumb({ ...breadcrumb, level: 'day', day });
    setFilters({ ...filters, fileDate: format(day.date, 'yyyy-MM-dd') });
  };

  const navigateBack = () => {
    switch (breadcrumb.level) {
      case 'day':
        setBreadcrumb({ ...breadcrumb, level: 'week', day: undefined });
        setFilters({ ...filters, fileDate: undefined });
        break;
      case 'week':
        setBreadcrumb({ ...breadcrumb, level: 'month', week: undefined });
        setFilters({ ...filters, financialWeek: undefined });
        break;
      case 'month':
        setBreadcrumb({ ...breadcrumb, level: 'year', month: undefined });
        break;
      case 'year':
        setBreadcrumb({ level: 'root' });
        setFilters({ clientId: selectedClient });
        break;
    }
  };

  const navigateToRoot = () => {
    setBreadcrumb({ level: 'root' });
    setFilters({ clientId: selectedClient });
  };

  // Handle delete
  const confirmDelete = (file: FileRecord) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (fileToDelete) {
      await deleteFile(fileToDelete);
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  // Get files for current day view
  const filesForCurrentView = useMemo(() => {
    if (breadcrumb.level !== 'day') return [];
    return files;
  }, [files, breadcrumb.level]);

  // File count per folder
  const getFileCountForYear = (year: FinancialYearInfo) => {
    return files.filter(f => f.financial_year === year.label).length;
  };

  const getFileCountForMonth = (month: FinancialMonthInfo) => {
    return files.filter(f => {
      const fileDate = parseISO(f.file_date);
      return fileDate.getMonth() === month.month && fileDate.getFullYear() === month.year;
    }).length;
  };

  const getFileCountForWeek = (week: FinancialWeekInfo) => {
    return files.filter(f => f.financial_week === week.weekNumber).length;
  };

  const getFileCountForDay = (day: FinancialDayInfo) => {
    return files.filter(f => f.file_date === format(day.date, 'yyyy-MM-dd')).length;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Render breadcrumb
  const renderBreadcrumb = () => (
    <div className="flex items-center gap-2 text-sm mb-4 flex-wrap">
      <Button
        variant="link"
        className="p-0 h-auto text-primary hover:text-primary/80"
        onClick={navigateToRoot}
      >
        Files
      </Button>
      {breadcrumb.year && (
        <>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Button
            variant="link"
            className={cn("p-0 h-auto", breadcrumb.level === 'year' ? 'text-foreground font-medium' : 'text-primary hover:text-primary/80')}
            onClick={() => breadcrumb.level !== 'year' && navigateToYear(breadcrumb.year!)}
          >
            {breadcrumb.year.label}
          </Button>
        </>
      )}
      {breadcrumb.month && (
        <>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Button
            variant="link"
            className={cn("p-0 h-auto", breadcrumb.level === 'month' ? 'text-foreground font-medium' : 'text-primary hover:text-primary/80')}
            onClick={() => breadcrumb.level !== 'month' && navigateToMonth(breadcrumb.month!)}
          >
            {breadcrumb.month.label}
          </Button>
        </>
      )}
      {breadcrumb.week && (
        <>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Button
            variant="link"
            className={cn("p-0 h-auto", breadcrumb.level === 'week' ? 'text-foreground font-medium' : 'text-primary hover:text-primary/80')}
            onClick={() => breadcrumb.level !== 'week' && navigateToWeek(breadcrumb.week!)}
          >
            Week {breadcrumb.week.weekNumber}
          </Button>
        </>
      )}
      {breadcrumb.day && (
        <>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground font-medium">{breadcrumb.day.label}</span>
        </>
      )}
    </div>
  );

  // Render folder grid
  const renderFolderGrid = (items: React.ReactNode[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items}
    </div>
  );

  // Folder item component
  const FolderItem = ({ 
    label, 
    count, 
    onClick, 
    icon: Icon = Folder,
    disabled = false,
  }: { 
    label: string; 
    count: number; 
    onClick: () => void; 
    icon?: typeof Folder;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group flex items-center gap-3 p-4 rounded-lg border border-border bg-card transition-all duration-200 text-left w-full",
        disabled 
          ? "opacity-50 cursor-not-allowed" 
          : "hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm"
      )}
    >
      <div className={cn(
        "p-2 rounded-lg transition-colors",
        disabled ? "bg-muted" : "bg-amber-500/10 group-hover:bg-amber-500/20"
      )}>
        <Icon className={cn("h-5 w-5", disabled ? "text-muted-foreground" : "text-amber-600")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{label}</p>
        <p className="text-xs text-muted-foreground">{count} file{count !== 1 ? 's' : ''}</p>
      </div>
      {!disabled && <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />}
    </button>
  );

  // Render content based on level
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      );
    }

    switch (breadcrumb.level) {
      case 'root':
        return renderFolderGrid(
          availableYears.map(year => (
            <FolderItem
              key={year.label}
              label={year.label}
              count={getFileCountForYear(year)}
              onClick={() => navigateToYear(year)}
            />
          ))
        );

      case 'year':
        const months = getMonthsForFinancialYear(breadcrumb.year!);
        return renderFolderGrid(
          months.map(month => (
            <FolderItem
              key={`${month.year}-${month.month}`}
              label={month.label}
              count={getFileCountForMonth(month)}
              onClick={() => navigateToMonth(month)}
            />
          ))
        );

      case 'month':
        const weeks = getWeeksForMonth(breadcrumb.month!, breadcrumb.year!);
        return renderFolderGrid(
          weeks.map(week => (
            <FolderItem
              key={week.weekNumber}
              label={week.label}
              count={getFileCountForWeek(week)}
              onClick={() => navigateToWeek(week)}
              icon={Calendar}
            />
          ))
        );

      case 'week':
        const days = getDaysForWeek(breadcrumb.week!, breadcrumb.year!);
        return renderFolderGrid(
          days.map(day => (
            <FolderItem
              key={day.date.toISOString()}
              label={day.label}
              count={getFileCountForDay(day)}
              onClick={() => day.isWithinFY && navigateToDay(day)}
              icon={Clock}
              disabled={!day.isWithinFY}
            />
          ))
        );

      case 'day':
        if (filesForCurrentView.length === 0) {
          return (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No files</h3>
              <p className="text-sm text-muted-foreground mb-4">
                No files have been uploaded for this date yet.
              </p>
              {isAdmin && (
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              )}
            </div>
          );
        }

        return (
          <div className="space-y-2">
            {filesForCurrentView.map(file => {
              const client = clients.find(c => c.id === file.client_id);
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{file.file_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.file_size)}</span>
                      {file.file_type && (
                        <>
                          <span>•</span>
                          <Badge variant="secondary" className="text-xs py-0">
                            {file.file_type}
                          </Badge>
                        </>
                      )}
                      {client && isAdmin && (
                        <>
                          <span>•</span>
                          <span>{client.company_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => downloadFile(file)}
                      className="h-8 w-8"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDelete(file)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Files</h2>
          <p className="text-sm text-muted-foreground">
            Browse and manage files organized by UK Financial Year
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            {isAdmin && (
              <Select value={selectedClient || 'all'} onValueChange={handleClientChange}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All clients</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-4">
          {breadcrumb.level !== 'root' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateBack}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          {renderBreadcrumb()}
          {renderContent()}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      {isAdmin && (
        <FileUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          clients={clients}
          onUpload={uploadFile}
          defaultDate={breadcrumb.day?.date}
          defaultClientId={selectedClient}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{fileToDelete?.file_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
