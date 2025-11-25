import React, { createContext, useContext, useState, useCallback } from 'react';

export interface AppState {
  selectedPlatform: string | null;
  isGroupModalOpen: boolean;
  isFeatureModalOpen: boolean;
  isEditModalOpen: boolean;
  isSegmentModalOpen: boolean;
  isCreateSegmentModalOpen: boolean;
  isLogModalOpen: boolean;
  isCreatePlatformModalOpen: boolean;
  editingFeature: any | null;
  selectedGroupId: string | null;
  selectedFeature: any | null;
  editingSegmentIndex: number | null;
  logFeature: any | null;
  logPlatform: string | null;
  logGroupName: string | null;
  expandedGroups: string[];
  scrollPosition: number;
}

export interface AppActions {
  setPlatform: (platform: string | null) => void;
  openGroupModal: () => void;
  closeGroupModal: () => void;
  openFeatureModal: (groupId: string) => void;
  closeFeatureModal: () => void;
  openEditModal: (feature: any) => void;
  closeEditModal: () => void;
  openSegmentModal: (feature: any, segmentIndex?: number) => void;
  closeSegmentModal: () => void;
  openCreateSegmentModal: () => void;
  closeCreateSegmentModal: () => void;
  openLogModal: (feature: any, platform: string, groupName: string) => void;
  closeLogModal: () => void;
  openCreatePlatformModal: () => void;
  closeCreatePlatformModal: () => void;
  setExpandedGroups: (groupIds: string[]) => void;
  saveScrollPosition: (position: number) => void;
  restoreScrollPosition: () => void;
}

export interface AppContextType {
  state: { app: AppState };
  actions: AppActions;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSegmentModalOpen, setIsSegmentModalOpen] = useState(false);
  const [isCreateSegmentModalOpen, setIsCreateSegmentModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isCreatePlatformModalOpen, setIsCreatePlatformModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<any | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
  const [editingSegmentIndex, setEditingSegmentIndex] = useState<number | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [logFeature, setLogFeature] = useState<any | null>(null);
  const [logPlatform, setLogPlatform] = useState<string | null>(null);
  const [logGroupName, setLogGroupName] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [scrollPosition, setScrollPosition] = useState<number>(0);

  const actions: AppActions = {
    setPlatform: useCallback((platform: string | null) => {
      setSelectedPlatform(platform);
    }, []),
    openGroupModal: useCallback(() => setIsGroupModalOpen(true), []),
    closeGroupModal: useCallback(() => setIsGroupModalOpen(false), []),
    openFeatureModal: useCallback((groupId: string) => {
      setSelectedGroupId(groupId);
      setIsFeatureModalOpen(true);
    }, []),
    closeFeatureModal: useCallback(() => {
      setSelectedGroupId(null);
      setIsFeatureModalOpen(false);
    }, []),
    openEditModal: useCallback((feature: any) => {
      setEditingFeature(feature);
      setIsEditModalOpen(true);
    }, []),
    closeEditModal: useCallback(() => {
      setEditingFeature(null);
      setIsEditModalOpen(false);
    }, []),
    openSegmentModal: useCallback((feature: any, segmentIndex?: number) => {
      setSelectedFeature(feature);
      setEditingSegmentIndex(segmentIndex !== undefined ? segmentIndex : null);
      setIsSegmentModalOpen(true);
    }, []),
    closeSegmentModal: useCallback(() => {
      setSelectedFeature(null);
      setEditingSegmentIndex(null);
      setIsSegmentModalOpen(false);
    }, []),
    openCreateSegmentModal: useCallback(() => {
      setIsCreateSegmentModalOpen(true);
    }, []),
    closeCreateSegmentModal: useCallback(() => {
      setIsCreateSegmentModalOpen(false);
    }, []),
    openLogModal: useCallback((feature: any, platform: string, groupName: string) => {
      setLogFeature(feature);
      setLogPlatform(platform);
      setLogGroupName(groupName);
      setIsLogModalOpen(true);
    }, []),
    closeLogModal: useCallback(() => {
      setLogFeature(null);
      setLogPlatform(null);
      setLogGroupName(null);
      setIsLogModalOpen(false);
    }, []),
    openCreatePlatformModal: useCallback(() => {
      setIsCreatePlatformModalOpen(true);
    }, []),
    closeCreatePlatformModal: useCallback(() => {
      setIsCreatePlatformModalOpen(false);
    }, []),
    setExpandedGroups: useCallback((groupIds: string[]) => {
      setExpandedGroups(groupIds);
    }, []),
    saveScrollPosition: useCallback((position: number) => {
      setScrollPosition(position);
    }, []),
    restoreScrollPosition: useCallback(() => {
      if (scrollPosition > 0) {
        setTimeout(() => {
          window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
        }, 100);
      }
    }, [scrollPosition]),
  };

  const contextValue: AppContextType = {
    state: {
      app: {
        selectedPlatform,
        isGroupModalOpen,
        isFeatureModalOpen,
        isEditModalOpen,
        isSegmentModalOpen,
        isCreateSegmentModalOpen,
        isLogModalOpen,
        isCreatePlatformModalOpen,
        editingFeature,
        selectedGroupId,
        selectedFeature,
        editingSegmentIndex,
        logFeature,
        logPlatform,
        logGroupName,
        expandedGroups,
        scrollPosition,
      },
    },
    actions,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
