import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Trash2, AlertTriangle, FileText, Users, Receipt, MessageSquare, FolderOpen } from 'lucide-react';

interface DataCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  tables: string[];
}

const DATA_CATEGORIES: DataCategory[] = [
  {
    id: 'invoices',
    label: 'Invoices',
    icon: <FileText className="h-4 w-4" />,
    description: 'All client invoices and line items',
    tables: ['invoice_line_items', 'invoices'],
  },
  {
    id: 'selfBills',
    label: 'Self-Billed Invoices',
    icon: <Receipt className="h-4 w-4" />,
    description: 'All contractor remittance advices',
    tables: ['self_billed_invoices'],
  },
  {
    id: 'candidates',
    label: 'Candidates',
    icon: <Users className="h-4 w-4" />,
    description: 'All contractor/candidate records',
    tables: ['candidates'],
  },
  {
    id: 'files',
    label: 'Uploaded Files',
    icon: <FolderOpen className="h-4 w-4" />,
    description: 'All uploaded documents and files',
    tables: ['files'],
  },
  {
    id: 'support',
    label: 'Support Tickets',
    icon: <MessageSquare className="h-4 w-4" />,
    description: 'All support tickets and messages',
    tables: ['support_messages', 'support_tickets'],
  },
];

export default function ClearHistoryButton() {
  const [isClearing, setIsClearing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const selectAll = () => {
    setSelectedCategories(new Set(DATA_CATEGORIES.map(c => c.id)));
  };

  const clearAll = () => {
    setSelectedCategories(new Set());
  };

  const handleClear = async () => {
    if (selectedCategories.size === 0) {
      toast.error('Please select at least one category to clear');
      return;
    }

    setIsClearing(true);
    const errors: string[] = [];

    // Get all tables to delete in order (respecting foreign keys)
    const tablesToDelete: string[] = [];
    DATA_CATEGORIES.forEach(category => {
      if (selectedCategories.has(category.id)) {
        category.tables.forEach(table => {
          if (!tablesToDelete.includes(table)) {
            tablesToDelete.push(table);
          }
        });
      }
    });

    // Delete in proper order
    for (const table of tablesToDelete) {
      const { error } = await supabase
        .from(table as any)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (error) {
        errors.push(`${table}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      toast.error('Some data could not be cleared', {
        description: errors.join('; '),
      });
    } else {
      const clearedCount = selectedCategories.size;
      toast.success(`Cleared ${clearedCount} ${clearedCount === 1 ? 'category' : 'categories'} successfully`);
    }

    setIsDialogOpen(false);
    setSelectedCategories(new Set());
    setIsClearing(false);
  };

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Clear History
        </CardTitle>
        <CardDescription>
          Permanently delete data. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Clear Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Clear History
              </AlertDialogTitle>
              <AlertDialogDescription>
                Select which data to permanently delete:
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="space-y-3 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Quick select:</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAll} className="h-7 px-2 text-xs">
                    Select All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 px-2 text-xs">
                    Clear
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                {DATA_CATEGORIES.map((category) => (
                  <div
                    key={category.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedCategories.has(category.id)
                        ? 'border-destructive/50 bg-destructive/10'
                        : 'border-border hover:border-destructive/30'
                    }`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <Checkbox
                      checked={selectedCategories.has(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {category.icon}
                        <Label className="font-medium cursor-pointer">{category.label}</Label>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {category.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedCategories(new Set())}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClear}
                disabled={selectedCategories.size === 0 || isClearing}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isClearing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete {selectedCategories.size > 0 ? `(${selectedCategories.size})` : ''}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
