import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Candidate } from '@/types/candidate';
import { toast } from 'sonner';

export function useCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('candidates')
        .select('*')
        .order('candidate_name', { ascending: true });

      if (fetchError) throw fetchError;
      setCandidates((data || []) as Candidate[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch candidates';
      setError(message);
      toast.error('Failed to load candidates', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Match candidate by Candidate Name + Account Number OR internal ID
  const findMatchingCandidate = useCallback((
    candidateName: string,
    accountNumber: string | null
  ): Candidate | undefined => {
    return candidates.find(c => {
      // Match by candidate name + account number (case insensitive)
      const nameMatch = c.candidate_name.toLowerCase() === candidateName.toLowerCase();
      const accountMatch = accountNumber 
        ? c.account_number?.toLowerCase() === accountNumber.toLowerCase()
        : !c.account_number;
      return nameMatch && accountMatch;
    });
  }, [candidates]);

  const upsertCandidates = useCallback(async (
    newCandidates: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>[]
  ): Promise<{ inserted: number; updated: number; errors: string[] }> => {
    const result = { inserted: 0, updated: 0, errors: [] as string[] };

    for (const candidate of newCandidates) {
      try {
        // Check if candidate exists by Candidate Name + Account Number
        const { data: existing } = await supabase
          .from('candidates')
          .select('id')
          .eq('candidate_name', candidate.candidate_name)
          .eq('account_number', candidate.account_number || '')
          .maybeSingle();

        if (existing) {
          // Update existing - manual edits in UI override uploaded values
          // Only update fields that have values in the upload
          const updateData: Record<string, unknown> = {};
          
          if (candidate.address) updateData.address = candidate.address;
          if (candidate.agency) updateData.agency = candidate.agency;
          if (candidate.beneficiary_name) updateData.beneficiary_name = candidate.beneficiary_name;
          if (candidate.sort_code) updateData.sort_code = candidate.sort_code;
          if (candidate.bank_name) updateData.bank_name = candidate.bank_name;
          if (candidate.ni_number) updateData.ni_number = candidate.ni_number;
          if (candidate.gender) updateData.gender = candidate.gender;
          if (candidate.dob) updateData.dob = candidate.dob;
          if (candidate.contact_no) updateData.contact_no = candidate.contact_no;
          if (candidate.email) updateData.email = candidate.email;
          if (candidate.internal_name) updateData.internal_name = candidate.internal_name;
          if (candidate.has_candidate_id !== null) updateData.has_candidate_id = candidate.has_candidate_id;
          if (candidate.application !== null) updateData.application = candidate.application;
          if (candidate.proof_of_address !== null) updateData.proof_of_address = candidate.proof_of_address;
          if (candidate.right_to_work !== null) updateData.right_to_work = candidate.right_to_work;

          if (Object.keys(updateData).length > 0) {
            const { error: updateError } = await supabase
              .from('candidates')
              .update(updateData)
              .eq('id', existing.id);

            if (updateError) throw updateError;
          }
          result.updated++;
        } else {
          // Insert new
          const { error: insertError } = await supabase
            .from('candidates')
            .insert({
              emp_id: candidate.emp_id,
              candidate_name: candidate.candidate_name,
              client_id: candidate.client_id,
              address: candidate.address,
              agency: candidate.agency,
              beneficiary_name: candidate.beneficiary_name,
              account_number: candidate.account_number,
              sort_code: candidate.sort_code,
              bank_name: candidate.bank_name,
              ni_number: candidate.ni_number,
              gender: candidate.gender,
              dob: candidate.dob,
              contact_no: candidate.contact_no,
              email: candidate.email,
              internal_name: candidate.internal_name,
              has_candidate_id: candidate.has_candidate_id,
              application: candidate.application,
              proof_of_address: candidate.proof_of_address,
              right_to_work: candidate.right_to_work,
            });

          if (insertError) throw insertError;
          result.inserted++;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        result.errors.push(`${candidate.candidate_name}: ${message}`);
      }
    }

    // Refresh candidates list
    await fetchCandidates();

    return result;
  }, [fetchCandidates]);

  const updateCandidate = useCallback(async (
    id: string,
    updates: Partial<Omit<Candidate, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<void> => {
    try {
      const { error: updateError } = await supabase
        .from('candidates')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;
      
      await fetchCandidates();
      toast.success('Candidate updated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update candidate';
      toast.error('Update failed', { description: message });
      throw err;
    }
  }, [fetchCandidates]);

  const getCandidateByEmpId = useCallback((empId: string): Candidate | undefined => {
    return candidates.find(c => c.emp_id === empId);
  }, [candidates]);

  // Match candidate by name (with whitespace normalization)
  const getCandidateByName = useCallback((firstName: string, surname: string): Candidate | undefined => {
    const fullName = `${firstName} ${surname}`.trim().toLowerCase().replace(/\s+/g, ' ');
    return candidates.find(c => {
      const candidateName = c.candidate_name.trim().toLowerCase().replace(/\s+/g, ' ');
      return candidateName === fullName;
    });
  }, [candidates]);

  const getCandidatesByEmpIds = useCallback((empIds: string[]): Map<string, Candidate> => {
    const map = new Map<string, Candidate>();
    empIds.forEach(empId => {
      const candidate = candidates.find(c => c.emp_id === empId);
      if (candidate) {
        map.set(empId, candidate);
      }
    });
    return map;
  }, [candidates]);

  const clearAllCandidates = useCallback(async (): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from('candidates')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (deleteError) throw deleteError;
      
      setCandidates([]);
      toast.success('All candidates cleared');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear candidates';
      toast.error('Clear failed', { description: message });
      throw err;
    }
  }, []);

  const addCandidate = useCallback(async (
    candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<void> => {
    try {
      const { error: insertError } = await supabase
        .from('candidates')
        .insert(candidate);

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('A candidate with this Employee ID already exists');
        }
        throw insertError;
      }
      
      await fetchCandidates();
      toast.success('Candidate added');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add candidate';
      toast.error('Add failed', { description: message });
      throw err;
    }
  }, [fetchCandidates]);

  return {
    candidates,
    isLoading,
    error,
    upsertCandidates,
    updateCandidate,
    addCandidate,
    getCandidateByEmpId,
    getCandidateByName,
    getCandidatesByEmpIds,
    findMatchingCandidate,
    clearAllCandidates,
    refreshCandidates: fetchCandidates,
  };
}
