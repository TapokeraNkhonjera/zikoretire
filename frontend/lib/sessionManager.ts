export interface TabSession {
  tabId: string;
  userId: string;
  role: string;
  timestamp: number;
}

class SessionManager {
  private static readonly STORAGE_KEY = 'zikoretire-sessions';
  
  static getCurrentTabSession(): TabSession | null {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return null;
    }
    
    const tabId = this.getTabId();
    const sessions = this.getAllSessions();
    return sessions.find(session => session.tabId === tabId) || null;
  }
  
  static setCurrentTabSession(session: any): void {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    const tabId = this.getTabId();
    const sessions = this.getAllSessions();
    
    // Remove existing session for this tab
    const filteredSessions = sessions.filter(s => s.tabId !== tabId);
    
    // Add current session
    const currentSession: TabSession = {
      tabId,
      userId: session.user?.id || '',
      role: session.user?.role || 'USER',
      timestamp: Date.now()
    };
    
    filteredSessions.push(currentSession);
    
    // Keep only last 10 sessions to prevent storage bloat
    const limitedSessions = filteredSessions.slice(-10);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedSessions));
  }
  
  static removeTabSession(tabId: string): void {
    const sessions = this.getAllSessions();
    const filteredSessions = sessions.filter(s => s.tabId !== tabId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSessions));
  }
  
  static getAllSessions(): TabSession[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }
  
  static getTabId(): string {
    // Generate unique tab ID or use existing one
    let tabId = sessionStorage.getItem('zikoretire-tab-id');
    if (!tabId) {
      tabId = 'tab-' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('zikoretire-tab-id', tabId);
    }
    return tabId;
  }
  
  static cleanupOldSessions(): void {
    const sessions = this.getAllSessions();
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    const validSessions = sessions.filter(session => 
      session.timestamp > oneHourAgo
    );
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validSessions));
  }
  
  static clearOtherSessionsForUser(userId: string): void {
    // Clear all other sessions for this user when logging in
    const sessions = this.getAllSessions();
    const filteredSessions = sessions.filter(s => 
      s.userId !== userId || s.tabId === this.getTabId()
    );
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSessions));
  }
  
  static logoutUser(userId: string): void {
    // Remove all sessions for this user
    const sessions = this.getAllSessions();
    const filteredSessions = sessions.filter(s => s.userId !== userId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSessions));
  }
}

export default SessionManager;
