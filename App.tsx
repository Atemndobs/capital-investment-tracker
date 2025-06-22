import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar, SummaryCard, ContributionDonutChart, ContributionTable, ContributionForm, Modal, SettingsModal, LoadingSpinner, SetupBanner, AlertDialog } from './components';
import { Contribution, Contributor, ModalView, ContributorSummary, SupabaseCredentials, SupabaseStatus, GeminiStatus } from './types';
import {
  CHART_COLORS,
  API_KEY_STORAGE_KEY,
  SUPABASE_URL_STORAGE_KEY,
  SUPABASE_ANON_KEY_STORAGE_KEY,
  THEME_STORAGE_KEY
} from './constants';
import { initializeGeminiService, getGeminiApiKeyStatus as getServiceGeminiStatus } from './services';
import { 
  initializeSupabaseService, 
  getSupabaseStatus as getServiceSupabaseStatus,
  fetchContributions,
  addContribution as sbAddContribution,
  updateContribution as sbUpdateContribution,
  deleteContribution as sbDeleteContribution,
  fetchContributors,
  addContributor as sbAddContributor,
  updateContributor as sbUpdateContributor
} from './supabaseService';

const getFormattedErrorMessage = (error: any): string => {
  let messageForAlert = "An unknown error occurred. Check the console for more details.";

  if (typeof error === 'string' && error.trim() !== "") {
    messageForAlert = error;
  } else if (error && typeof error.message === 'string' && error.message.trim() !== "") {
    messageForAlert = error.message;
    if (error.code !== undefined) { // Append code if also present
      messageForAlert += ` (Code: ${error.code})`;
    }
  } else if (error && error.code !== undefined) {
    messageForAlert = `Operation failed with error code: ${error.code}.`;
    if (typeof error.details === 'string' && error.details.trim() !== "") {
      messageForAlert += ` Details: ${error.details}`;
    }
     if (typeof error.hint === 'string' && error.hint.trim() !== "") {
      messageForAlert += ` Hint: ${error.hint}`;
    }
  }
  return messageForAlert;
};

interface AlertConfig {
  title: string;
  description: string;
  confirmButtonText: string;
  onConfirm: () => void;
}

const App: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  
  // Attempt to load API keys and Supabase credentials from environment variables first
  const initialGeminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
  const initialSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || null;
  const initialSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || null;

  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(initialGeminiApiKey);
  const [supabaseCreds, setSupabaseCreds] = useState<SupabaseCredentials>({ url: initialSupabaseUrl, anonKey: initialSupabaseAnonKey });
  
  const [modalView, setModalView] = useState<ModalView>(ModalView.NONE);
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterContributorId, setFilterContributorId] = useState('');
  
  const [currentGeminiStatus, setCurrentGeminiStatus] = useState<GeminiStatus>(getServiceGeminiStatus());
  const [currentSupabaseStatus, setCurrentSupabaseStatus] = useState<SupabaseStatus>(getServiceSupabaseStatus());

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSavingContribution, setIsSavingContribution] = useState(false); 
  const [isSavingContributor, setIsSavingContributor] = useState(false);
  const [showSetupBanner, setShowSetupBanner] = useState(false);
  const [initialConfigAttempted, setInitialConfigAttempted] = useState(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [isDeletingContribution, setIsDeletingContribution] = useState(false); // Declared only once

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode) return savedMode === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Initialize services and load data based on environment variables or fallbacks
  useEffect(() => {
    // Initialize Gemini
    initializeGeminiService(geminiApiKey);
    setCurrentGeminiStatus(getServiceGeminiStatus());

    // Initialize Supabase
    if (supabaseCreds.url && supabaseCreds.anonKey) {
      if (initializeSupabaseService(supabaseCreds.url, supabaseCreds.anonKey)) {
        setCurrentSupabaseStatus(getServiceSupabaseStatus());
        setShowSetupBanner(false);
      } else {
        setCurrentSupabaseStatus(getServiceSupabaseStatus()); // Update status even if initialization fails
        setShowSetupBanner(true); // Show banner if initialization fails
      }
    } else {
      setCurrentSupabaseStatus(getServiceSupabaseStatus()); // Reflect that Supabase is not configured
      setShowSetupBanner(true); // Show banner if credentials are not set
    }
    setInitialConfigAttempted(true);
  }, [geminiApiKey, supabaseCreds]); // Re-run if keys/creds change

  // Load Supabase data if Supabase is successfully initialized
  const loadSupabaseData = useCallback(async () => {
    if (!initialConfigAttempted) return;

    // Check if Supabase is actually configured and initialized
    if (currentSupabaseStatus.type === 'success') {
      setIsLoadingData(true);
      try {
        const [fetchedContributors, fetchedContributions] = await Promise.all([
          fetchContributors(),
          fetchContributions()
        ]);
        setContributors(fetchedContributors);
        setContributions(fetchedContributions.map(c => ({...c, isOptimistic: false, hasError: false })));
      } catch (error: any) {
        console.error("Error fetching initial data from Supabase. Details:", error);
        const errorMessage = getFormattedErrorMessage(error);
        alert(`Error fetching data: ${errorMessage}. Check Supabase setup and console.`);
        setContributors([]);
        setContributions([]);
      } finally {
        setIsLoadingData(false);
      }
    } else {
      // If Supabase is not successful, ensure data is cleared and banner is shown if needed
      setContributors([]);
      setContributions([]);
      if (!supabaseCreds.url || !supabaseCreds.anonKey) {
        setShowSetupBanner(true);
      }
    }
  }, [supabaseCreds, initialConfigAttempted, currentSupabaseStatus]); // Depend on status to trigger data load

  useEffect(() => {
    loadSupabaseData();
  }, [loadSupabaseData]);


  // Persist Gemini API Key to localStorage if it's set
  useEffect(() => {
    if (geminiApiKey) {
      localStorage.setItem(API_KEY_STORAGE_KEY, geminiApiKey);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
    // Re-initialize Gemini service if the key changes
    initializeGeminiService(geminiApiKey);
    setCurrentGeminiStatus(getServiceGeminiStatus());
  }, [geminiApiKey]);

  // Persist Supabase credentials to localStorage if they are set
  useEffect(() => {
    if (initialConfigAttempted) {
        if (supabaseCreds.url) localStorage.setItem(SUPABASE_URL_STORAGE_KEY, supabaseCreds.url);
        else localStorage.removeItem(SUPABASE_URL_STORAGE_KEY);
        if (supabaseCreds.anonKey) localStorage.setItem(SUPABASE_ANON_KEY_STORAGE_KEY, supabaseCreds.anonKey);
        else localStorage.removeItem(SUPABASE_ANON_KEY_STORAGE_KEY);
    }
  }, [supabaseCreds, initialConfigAttempted]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prevMode: boolean) => !prevMode);

  const handleAddOrUpdateContribution = async (
    contributionData: Omit<Contribution, 'id' | 'created_at' | 'updated_at'>, 
    originalId?: string 
  ) => {
    setIsSavingContribution(true); 
    closeModal(); 

    if (originalId) { 
      const originalContribution = contributions.find((c: Contribution) => c.id === originalId);
      if (!originalContribution) {
        console.error("Original contribution not found for update.");
        setIsSavingContribution(false);
        return;
      }

      const optimisticUpdatedContribution: Contribution = {
        ...originalContribution,
        ...contributionData,
        amount_usd: Number(contributionData.amount_usd), 
        isOptimistic: true,
        hasError: false,
      };
      setContributions((prev: Contribution[]) => prev.map((c: Contribution) => c.id === originalId ? optimisticUpdatedContribution : c));
      
      try {
        const updatedFromSupabase = await sbUpdateContribution(originalId, {
          contributed_at: contributionData.contributed_at,
          amount_usd: Number(contributionData.amount_usd),
          comment: contributionData.comment,
        });
        setContributions((prev: Contribution[]) => prev.map((c: Contribution) => c.id === originalId ? { ...updatedFromSupabase, isOptimistic: false, hasError: false } : c));
      } catch (error: any) {
        console.error("Error updating contribution in Supabase:", error);
        const errorMessage = getFormattedErrorMessage(error);
        alert(`Failed to update contribution: ${errorMessage}. Reverting changes.`);
        setContributions((prev: Contribution[]) => prev.map((c: Contribution) => c.id === originalId ? { ...originalContribution, hasError: true, isOptimistic: false } : c));
      } finally {
        setIsSavingContribution(false);
      }

    } else { 
      const tempId = `optimistic-${Date.now()}`;
      const optimisticNewContribution: Contribution = {
        // @ts-ignore
        id: tempId, 
        tempId: tempId,
        contributor_id: contributionData.contributor_id,
        contributed_at: contributionData.contributed_at,
        amount_usd: Number(contributionData.amount_usd), 
        comment: contributionData.comment,
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString(), 
        isOptimistic: true,
        hasError: false,
      };
      setContributions((prev: Contribution[]) => [...prev, optimisticNewContribution]);

      try {
        const addedFromSupabase = await sbAddContribution({
          contributor_id: contributionData.contributor_id,
          contributed_at: contributionData.contributed_at,
          amount_usd: Number(contributionData.amount_usd),
          comment: contributionData.comment,
        });
        setContributions((prev: Contribution[]) => prev.map((c: Contribution) => c.tempId === tempId ? { ...addedFromSupabase, isOptimistic: false, hasError: false } : c));
      } catch (error: any) {
        console.error("Error adding contribution to Supabase:", error);
        const errorMessage = getFormattedErrorMessage(error);
        alert(`Failed to add contribution: ${errorMessage}. Removing optimistic entry.`);
        setContributions((prev: Contribution[]) => prev.filter((c: Contribution) => c.tempId !== tempId));
      } finally {
        setIsSavingContribution(false);
      }
    }
    setEditingContribution(null); 
  };

  const confirmDeleteContribution = async (contributionId: string) => {
    if (!contributionId || isDeletingContribution) {
      return; // Prevent multiple calls
    }

    const previousContributions = [...contributions]; // Capture current state for potential rollback

    // Set loading state first
    setIsDeletingContribution(true);
    setIsAlertOpen(false); // Close the current alert
    setItemToDeleteId(null);

    // Then update the UI optimistically
    setContributions((prev: Contribution[]) => prev.filter((c: Contribution) => c.id !== contributionId));

    try {
      await sbDeleteContribution(contributionId);
      // If successful, the UI is already updated. No further action needed here.
    } catch (error: any) {
      console.error("Error deleting contribution from Supabase:", error);
      const errorMessage = getFormattedErrorMessage(error);
      // Display the error using the AlertDialog itself
      setAlertConfig({
        title: "Deletion Failed",
        description: `Failed to delete contribution: ${errorMessage}. Please try again.`,
        confirmButtonText: "OK",
        onConfirm: () => {
          setIsAlertOpen(false);
          setAlertConfig(null);
        },
      });
      setIsAlertOpen(true); // Re-open or keep open to show error
      setContributions(previousContributions); // Revert UI change
    } finally {
      setIsDeletingContribution(false); // Reset loading state
    }
  };
  
  const handleDeleteContributionRequest = (contributionId: string) => {
    const contributionToDelete = contributions.find((c: Contribution) => c.id === contributionId);
    if (!contributionToDelete) return;

    setItemToDeleteId(contributionId);
    setAlertConfig({
      title: "Delete Contribution?",
      description: `Are you sure you want to delete the contribution: "${contributionToDelete.comment || `Amount: $${contributionToDelete.amount_usd.toLocaleString()}`}"? This action cannot be undone.`,
      confirmButtonText: "Delete",
      onConfirm: () => confirmDeleteContribution(contributionId)
    });
    setIsAlertOpen(true);
  };


  const handleAddContributor = async (contributorData: Pick<Contributor, 'name' | 'email' | 'profilePictureUrl'>) => {
    setIsSavingContributor(true);
    try {
      const newContributor = await sbAddContributor(contributorData);
      setContributors((prev: Contributor[]) => [...prev, newContributor].sort((a: Contributor, b: Contributor) => a.name.localeCompare(b.name)));
    } catch (error: any) {
      console.error("Error adding contributor:", error);
      const errorMessage = getFormattedErrorMessage(error);
      alert(`Failed to add contributor: ${errorMessage}`);
    } finally {
      setIsSavingContributor(false);
    }
  };

  const handleUpdateContributor = async (id: string, updates: Partial<Pick<Contributor, 'name' | 'email' | 'profilePictureUrl'>>) => {
    setIsSavingContributor(true);
    try {
      const updatedContributor = await sbUpdateContributor(id, updates);
      setContributors((prev: Contributor[]) => prev.map((c: Contributor) => c.id === id ? { ...c, ...updatedContributor } : c).sort((a: Contributor, b: Contributor) => a.name.localeCompare(b.name)));
    } catch (error: any) {
      console.error("Error updating contributor:", error);
      const errorMessage = getFormattedErrorMessage(error);
      alert(`Failed to update contributor: ${errorMessage}`);
    } finally {
      setIsSavingContributor(false);
    }
  };

  const handleSaveGeminiApiKey = useCallback((newKey: string) => setGeminiApiKey(newKey), []);
  
  const handleSaveSupabaseCredentials = useCallback((url: string, anonKey: string) => {
    setSupabaseCreds({ url, anonKey }); 
    setShowSetupBanner(false); 
  }, []);

  const openAddModal = () => { setEditingContribution(null); setModalView(ModalView.ADD_CONTRIBUTION); };
  const openEditModal = (contribution: Contribution) => { setEditingContribution(contribution); setModalView(ModalView.EDIT_CONTRIBUTION); };
  const openSettingsModal = () => setModalView(ModalView.SETTINGS);
  const closeModal = () => { 
    setModalView(ModalView.NONE); 
    setEditingContribution(null); 
    setContributions((prev: Contribution[]) => prev.map((c: Contribution) => c.hasError ? {...c, hasError: false} : c));
  };

  const closeAlert = () => {
    setIsAlertOpen(false);
    setAlertConfig(null);
    setItemToDeleteId(null);
  };

  const contributorSummaries = useMemo((): ContributorSummary[] => {
    const grandTotal = contributions.filter((c: Contribution) => !c.isOptimistic || c.hasError === false).reduce((sum: number, c: Contribution) => sum + c.amount_usd, 0);
    return contributors.map((contributor: Contributor) => {
      const totalByContributor = contributions
        .filter((c: Contribution) => c.contributor_id === contributor.id && (!c.isOptimistic || c.hasError === false))
        .reduce((sum: number, c: Contribution) => sum + c.amount_usd, 0);
      const percentageShare = grandTotal > 0 ? (totalByContributor / grandTotal) * 100 : 0;
      const targetAmountFor50Percent = grandTotal > 0 ? grandTotal * 0.5 : 0;
      let progressTo50PercentTarget = targetAmountFor50Percent > 0 ? (totalByContributor / targetAmountFor50Percent) * 100 : (grandTotal === 0 ? 100 : 0);
      progressTo50PercentTarget = Math.min(100, Math.max(0, progressTo50PercentTarget));
      const diffToTarget5050 = totalByContributor - targetAmountFor50Percent;
      return { ...contributor, stats: { total: totalByContributor, percentageShare, diffToTarget5050, progressTo50PercentTarget } };
    });
  }, [contributions, contributors]);

  // Dynamic grid classes based on number of cards
  const getGridClasses = (cardCount: number): string => {
    switch (cardCount) {
      case 1:
        return "grid grid-cols-1 gap-6 mb-8"; // Full width
      case 2:
        return "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"; // Two cards side-by-side
      case 3:
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"; // All three on same line on large screens
      case 4:
        return "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"; // 2x2 layout
      default:
        // 5+ cards: responsive 2-column on medium, 3-column on large
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8";
    }
  };

  const getModalTitle = () => {
    switch(modalView) {
      case ModalView.ADD_CONTRIBUTION: return 'Add New Contribution';
      case ModalView.EDIT_CONTRIBUTION: return 'Edit Contribution';
      case ModalView.SETTINGS: return 'Application Settings';
      default: return '';
    }
  };
  
  const displayedContributions = useMemo(() => {
    return [...contributions].sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [contributions]);

  const canDisplayContent = initialConfigAttempted && currentSupabaseStatus.type === 'success';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-dark-bg transition-colors duration-300">
      <Navbar onAddContribution={openAddModal} onOpenSettings={openSettingsModal} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      {showSetupBanner && initialConfigAttempted && <SetupBanner onOpenSettings={openSettingsModal} />}

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {isLoadingData && <LoadingSpinner size="lg" />}
        
        {!isLoadingData && initialConfigAttempted && currentSupabaseStatus.type !== 'success' && !showSetupBanner && (
             <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
                <span className="font-medium">Supabase Connection Issue!</span> {currentSupabaseStatus.message} Please check configuration in Settings.
            </div>
        )}

        {!isLoadingData && canDisplayContent && (
          <>
            <section id="dashboard">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-dark-text-primary mb-6">Dashboard</h2>
              {contributors.length > 0 ? (
                <>
                  <div className={getGridClasses(contributorSummaries.length)}>
                    {contributorSummaries.map((summary: ContributorSummary, index: number) => (
                      <SummaryCard
                        key={summary.id}
                        contributor={summary}
                        color={CHART_COLORS[index % CHART_COLORS.length]}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>
                  <ContributionDonutChart 
                    summaries={contributorSummaries} 
                    colors={CHART_COLORS} 
                    allContributions={contributions}
                    isDarkMode={isDarkMode}
                  />
                </>
              ) : (
                <div className="text-center py-10 bg-white dark:bg-dark-card rounded-lg shadow">
                  <p className="text-lg text-slate-600 dark:text-dark-text-secondary">No contributors found.</p>
                  {currentSupabaseStatus.type === 'success' && 
                    <p className="mt-2 text-sm text-slate-500 dark:text-dark-text-secondary">
                        Please add contributors in <button type="button" onClick={openSettingsModal} className="text-nebula-purple dark:text-brand-purple hover:underline">Settings</button>.
                    </p>
                  }
                </div>
              )}
            </section>

            <section id="contributions-table">
                <ContributionTable
                    contributions={displayedContributions} 
                    contributors={contributors}
                    onEdit={openEditModal}
                    onDeleteRequest={handleDeleteContributionRequest}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterContributorId={filterContributorId}
                    setFilterContributorId={setFilterContributorId}
                    isLoading={isLoadingData}
                />
            </section>
          </>
        )}
         {!isLoadingData && initialConfigAttempted && !canDisplayContent && !showSetupBanner && (
            <div className="text-center py-10 bg-white dark:bg-dark-card rounded-lg shadow">
                <p className="text-lg text-slate-600 dark:text-dark-text-secondary">Cannot load data.</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-dark-text-secondary">
                    Supabase connection issue: {currentSupabaseStatus.message}
                    Please verify your setup in <button type="button" onClick={openSettingsModal} className="text-nebula-purple dark:text-brand-purple hover:underline">Settings</button>.
                </p>
            </div>
        )}
        
        <footer className="text-center py-8 text-slate-500 dark:text-dark-text-secondary border-t border-slate-200 dark:border-dark-border mt-12">
            <p>&copy; {new Date().getFullYear()} Nebula Logix. Capital Investment Tracker.</p>
            <p className="text-xs mt-1">For internal use only.</p>
        </footer>
      </main>

      {(modalView === ModalView.ADD_CONTRIBUTION || modalView === ModalView.EDIT_CONTRIBUTION) && (
        <Modal isOpen={true} onClose={closeModal} title={getModalTitle()}>
          <ContributionForm
            onClose={closeModal}
            onSave={handleAddOrUpdateContribution}
            contributors={contributors}
            initialData={editingContribution}
            isSaving={isSavingContribution}
          />
        </Modal>
      )}

      {modalView === ModalView.SETTINGS && (
         <SettingsModal
            isOpen={true}
            onClose={closeModal}
            contributors={contributors}
            onAddContributor={handleAddContributor}
            onUpdateContributor={handleUpdateContributor}
            isContributorSaving={isSavingContributor}
            geminiApiKey={geminiApiKey}
            onSaveGeminiApiKey={handleSaveGeminiApiKey}
            currentGeminiApiKeyStatus={currentGeminiStatus}
            supabaseUrl={supabaseCreds.url}
            supabaseAnonKey={supabaseCreds.anonKey}
            onSaveSupabaseCredentials={handleSaveSupabaseCredentials}
            currentSupabaseStatus={currentSupabaseStatus}
            isDarkMode={isDarkMode}
        />
      )}
      {alertConfig && (
        <AlertDialog
            isOpen={isAlertOpen}
            onClose={closeAlert}
            onConfirm={alertConfig.onConfirm}
            title={alertConfig.title}
            description={alertConfig.description}
            confirmButtonText={alertConfig.confirmButtonText}
            isLoading={isDeletingContribution} // Pass the loading state
        />
      )}

    </div>
  );
};


export default App;
