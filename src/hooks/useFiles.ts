import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getFinancialYearForDate, getFinancialWeekNumber, generateStoragePath } from '@/lib/ukFinancialCalendar';

export interface FileRecord {
  id: string;
  client_id: string | null;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string | null;
  file_type: string | null;
  financial_year: string;
  financial_week: number;
  file_date: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface FileFilters {
  clientId?: string;
  financialYear?: string;
  financialWeek?: number;
  fileDate?: string;
  searchTerm?: string;
}

export function useFiles(isClientView: boolean = false) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FileFilters>({});

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('files')
        .select('*')
        .order('file_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters.clientId) {
        query = query.eq('client_id', filters.clientId);
      }

      if (filters.financialYear) {
        query = query.eq('financial_year', filters.financialYear);
      }

      if (filters.financialWeek) {
        query = query.eq('financial_week', filters.financialWeek);
      }

      if (filters.fileDate) {
        query = query.eq('file_date', filters.fileDate);
      }

      if (filters.searchTerm) {
        query = query.ilike('file_name', `%${filters.searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to fetch files');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const uploadFile = useCallback(async (
    file: File,
    clientId: string | null,
    fileDate: Date,
    fileType?: string,
    description?: string
  ): Promise<FileRecord | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fy = getFinancialYearForDate(fileDate);
      const weekNumber = getFinancialWeekNumber(fileDate);
      const storagePath = generateStoragePath(
        clientId || 'general',
        fileDate,
        `${Date.now()}_${file.name}`
      );

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      // Create metadata record
      const fileRecord = {
        client_id: clientId,
        uploaded_by: user.id,
        file_name: file.name,
        file_path: storagePath,
        file_size: file.size,
        mime_type: file.type,
        file_type: fileType || 'document',
        financial_year: fy.label,
        financial_week: weekNumber,
        file_date: fileDate.toISOString().split('T')[0],
        description,
      };

      const { data, error } = await supabase
        .from('files')
        .insert(fileRecord)
        .select()
        .single();

      if (error) throw error;

      toast.success('File uploaded successfully');
      fetchFiles();
      return data;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      return null;
    }
  }, [fetchFiles]);

  const downloadFile = useCallback(async (file: FileRecord) => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(file.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('File downloaded');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  }, []);

  const deleteFile = useCallback(async (file: FileRecord): Promise<boolean> => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([file.file_path]);

      if (storageError) throw storageError;

      // Delete metadata
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (error) throw error;

      toast.success('File deleted');
      fetchFiles();
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
      return false;
    }
  }, [fetchFiles]);

  const renameFile = useCallback(async (file: FileRecord, newName: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('files')
        .update({ file_name: newName, updated_at: new Date().toISOString() })
        .eq('id', file.id);

      if (error) throw error;

      toast.success('File renamed');
      fetchFiles();
      return true;
    } catch (error) {
      console.error('Error renaming file:', error);
      toast.error('Failed to rename file');
      return false;
    }
  }, [fetchFiles]);

  const getFinancialYears = useCallback(() => {
    const years = [...new Set(files.map(f => f.financial_year))];
    return years.sort().reverse();
  }, [files]);

  const getFinancialWeeks = useCallback((year?: string) => {
    const filtered = year ? files.filter(f => f.financial_year === year) : files;
    const weeks = [...new Set(filtered.map(f => f.financial_week))];
    return weeks.sort((a, b) => a - b);
  }, [files]);

  return {
    files,
    isLoading,
    filters,
    setFilters,
    uploadFile,
    downloadFile,
    deleteFile,
    renameFile,
    refreshFiles: fetchFiles,
    getFinancialYears,
    getFinancialWeeks,
  };
}
