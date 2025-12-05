import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

type PopupType = 'global_discount' | 'new_account_discount' | 'announcement';

interface Popup {
  _id: string;
  type: PopupType;
  title: string;
  description: string;
  discountCode?: string;
  linkUrl?: string;
  linkText?: string;
  isActive: boolean;
}

interface PopupManagerProps {
  showNewAccountPopup?: boolean;
  onNewAccountPopupShown?: () => void;
}

type Props = Partial<PopupManagerProps>;

const DISMISSED_POPUPS_KEY = 'lumiere_dismissed_popups';
const NEW_ACCOUNT_POPUP_FLAG = 'lumiere_show_new_account_popup';

function getDismissedPopups(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem(DISMISSED_POPUPS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setPopupDismissed(popupId: string) {
  const dismissed = getDismissedPopups();
  dismissed[popupId] = true;
  localStorage.setItem(DISMISSED_POPUPS_KEY, JSON.stringify(dismissed));
}

export function triggerNewAccountPopup() {
  localStorage.setItem(NEW_ACCOUNT_POPUP_FLAG, 'true');
}

function checkAndClearNewAccountFlag(): boolean {
  const flag = localStorage.getItem(NEW_ACCOUNT_POPUP_FLAG);
  if (flag === 'true') {
    localStorage.removeItem(NEW_ACCOUNT_POPUP_FLAG);
    return true;
  }
  return false;
}

function PopupDialog({ 
  popup, 
  onClose 
}: { 
  popup: Popup; 
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (popup.discountCode) {
      await navigator.clipboard.writeText(popup.discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setPopupDismissed(popup._id);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-gradient-to-br from-neutral-900 to-black border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        data-testid="popup-dialog"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          data-testid="button-close-popup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          {popup.type !== 'announcement' && (
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Tag className="w-8 h-8 text-black" />
            </div>
          )}
          
          {popup.type === 'announcement' && (
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <ExternalLink className="w-8 h-8 text-white" />
            </div>
          )}

          <h2 className="text-2xl font-serif text-white mb-3" data-testid="popup-title">
            {popup.title}
          </h2>
          
          <p className="text-white/70 mb-6 leading-relaxed" data-testid="popup-description">
            {popup.description}
          </p>

          {popup.discountCode && (
            <div className="mb-6">
              <div 
                className="inline-flex items-center gap-3 bg-white/10 border border-dashed border-white/30 rounded-lg px-6 py-3 cursor-pointer hover:bg-white/15 transition-colors"
                onClick={handleCopyCode}
                data-testid="popup-discount-code"
              >
                <span className="text-xl font-bold tracking-widest text-white">
                  {popup.discountCode}
                </span>
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-white/50" />
                )}
              </div>
              <p className="text-xs text-white/40 mt-2">Click to copy code</p>
            </div>
          )}

          {popup.type === 'announcement' && popup.linkUrl && (
            <Link href={popup.linkUrl}>
              <Button 
                className="w-full bg-white text-black hover:bg-white/90"
                onClick={handleClose}
                data-testid="popup-link-button"
              >
                {popup.linkText || 'Learn More'}
              </Button>
            </Link>
          )}

          {popup.type !== 'announcement' && (
            <Button 
              className="w-full bg-white text-black hover:bg-white/90"
              onClick={handleClose}
              data-testid="popup-shop-button"
            >
              Start Shopping
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PopupManager({ 
  showNewAccountPopup = false,
  onNewAccountPopupShown 
}: PopupManagerProps) {
  const [activePopup, setActivePopup] = useState<Popup | null>(null);
  const [hasShownGlobalPopup, setHasShownGlobalPopup] = useState(false);
  const [shouldShowNewAccountPopup, setShouldShowNewAccountPopup] = useState(false);

  const { data: popups = [] } = useQuery<Popup[]>({
    queryKey: ['activePopups'],
    queryFn: async () => {
      const res = await fetch('/api/popups/active');
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const hasFlag = checkAndClearNewAccountFlag();
    if (hasFlag) {
      setShouldShowNewAccountPopup(true);
    }
  }, []);

  useEffect(() => {
    if ((showNewAccountPopup || shouldShowNewAccountPopup) && popups.length > 0) {
      const newAccountPopup = popups.find(p => p.type === 'new_account_discount');
      if (newAccountPopup) {
        const dismissed = getDismissedPopups();
        if (!dismissed[newAccountPopup._id]) {
          setTimeout(() => {
            setActivePopup(newAccountPopup);
            setShouldShowNewAccountPopup(false);
            onNewAccountPopupShown?.();
          }, 500);
        }
      }
    }
  }, [showNewAccountPopup, shouldShowNewAccountPopup, popups, onNewAccountPopupShown]);

  useEffect(() => {
    if (!hasShownGlobalPopup && popups.length > 0 && !showNewAccountPopup && !shouldShowNewAccountPopup && !activePopup) {
      const dismissed = getDismissedPopups();
      
      const globalPopup = popups.find(p => p.type === 'global_discount' && !dismissed[p._id]);
      if (globalPopup) {
        const timer = setTimeout(() => {
          setActivePopup(globalPopup);
          setHasShownGlobalPopup(true);
        }, 2000);
        return () => clearTimeout(timer);
      }

      const announcementPopup = popups.find(p => p.type === 'announcement' && !dismissed[p._id]);
      if (announcementPopup) {
        const timer = setTimeout(() => {
          setActivePopup(announcementPopup);
          setHasShownGlobalPopup(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [popups, hasShownGlobalPopup, showNewAccountPopup, shouldShowNewAccountPopup, activePopup]);

  const handleClose = () => {
    setActivePopup(null);
  };

  return (
    <AnimatePresence>
      {activePopup && (
        <PopupDialog popup={activePopup} onClose={handleClose} />
      )}
    </AnimatePresence>
  );
}
