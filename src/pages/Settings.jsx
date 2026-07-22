import React, { useState, useEffect } from 'react';
import { Trash2, ChevronRight, Shield, Bell, Moon, Sun, Monitor, Info, Download, Share, CheckCircle } from 'lucide-react';
import { useTheme } from '@/lib/ThemeProvider';
import { TransactionService } from '@/services/TransactionService';
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
import { useToast } from '@/components/ui/use-toast';

const Section = ({ title, children }) => (
  <div className="mb-5">
    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.12em] px-1 mb-2">{title}</p>
    <div className="bg-card rounded-[20px] border border-border/30 shadow-sm overflow-hidden">
      {children}
    </div>
  </div>
);

const Row = ({ icon: Icon, label, sublabel, onClick, danger, rightSlot, last }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-muted/40 active:bg-muted/60 ${!last ? 'border-b border-border/20' : ''} ${danger ? 'text-destructive' : 'text-foreground'}`}
  >
    <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ${danger ? 'bg-destructive/10' : 'bg-muted/60'}`}>
      <Icon size={16} strokeWidth={2} className={danger ? 'text-destructive' : 'text-foreground/70'} />
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-[14px] font-medium tracking-[-0.1px] ${danger ? 'text-destructive' : ''}`}>{label}</p>
      {sublabel && <p className="text-[12px] text-muted-foreground mt-0.5">{sublabel}</p>}
    </div>
    {rightSlot || <ChevronRight size={15} strokeWidth={2} className="text-muted-foreground/40 shrink-0" />}
  </button>
);

const THEME_OPTIONS = [
  { value: 'light', label: 'Claro', Icon: Sun },
  { value: 'dark', label: 'Escuro', Icon: Moon },
  { value: 'system', label: 'Sistema', Icon: Monitor },
];

function useInstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsInstalled(standalone);

    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  return { deferredPrompt, isInstalled, isIOS, showIOSGuide, setShowIOSGuide };
}

function IOSInstallGuide({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card w-full max-w-lg rounded-t-[28px] p-6 pb-10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-6" />
        <h2 className="text-[17px] font-bold tracking-[-0.3px] mb-1">Instalar no iPhone</h2>
        <p className="text-[13px] text-muted-foreground mb-5">Siga os passos abaixo no Safari:</p>
        <ol className="space-y-4">
          {[
            { icon: Share, text: 'Toque no botão Compartilhar na barra do Safari' },
            { icon: Download, text: 'Role para baixo e toque em "Adicionar à Tela de Início"' },
            { icon: CheckCircle, text: 'Toque em "Adicionar" no canto superior direito' },
          ].map(({ icon: Icon, text }, i) => (
            <li key={i} className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[12px] font-bold text-primary">{i + 1}</span>
              </div>
              <div className="flex items-center gap-2.5 flex-1">
                <Icon size={16} strokeWidth={2} className="text-muted-foreground shrink-0" />
                <p className="text-[14px] leading-snug">{text}</p>
              </div>
            </li>
          ))}
        </ol>
        <button
          onClick={onClose}
          className="mt-6 w-full py-3.5 bg-primary text-primary-foreground rounded-[14px] text-[15px] font-semibold"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { deferredPrompt, isInstalled, isIOS, showIOSGuide, setShowIOSGuide } = useInstallPWA();

  const handleInstall = async () => {
    if (isIOS) { setShowIOSGuide(true); return; }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') toast({ title: 'App instalado!', description: 'Acesse pelo ícone na tela inicial.', duration: 1000 });
  };

  const handleDeleteAllData = () => {
    TransactionService.clearAll();
    toast({ title: 'Dados excluídos', description: 'Todas as suas transações foram removidas.', duration: 1000 });
    setShowDeleteConfirm(false);
  };

  return (
    <div className="flex-1 min-h-0 bg-background flex flex-col">
      <div
        className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl shrink-0"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="max-w-lg mx-auto px-5 h-14 flex items-center">
          <h1 className="text-[20px] font-bold tracking-[-0.4px]">Configurações</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-w-lg mx-auto w-full px-5 pt-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)' }}>
        <Section title="Conta">
          <Row icon={Shield} label="Privacidade" sublabel="Gerencie seus dados" last={false} />
          <Row icon={Bell} label="Notificações" sublabel="Alertas de vencimento" last={false} />
          <Row
            icon={Moon}
            label="Aparência"
            sublabel={THEME_OPTIONS.find(o => o.value === theme)?.label || 'Sistema'}
            onClick={() => setShowThemePicker(p => !p)}
            last
            rightSlot={
              <ChevronRight
                size={15}
                strokeWidth={2}
                className={`text-muted-foreground/40 shrink-0 transition-transform ${showThemePicker ? 'rotate-90' : ''}`}
              />
            }
          />
          {showThemePicker && (
            <div className="flex border-t border-border/20">
              {THEME_OPTIONS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => { setTheme(value); setShowThemePicker(false); }}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 text-[12px] font-medium transition-colors ${theme === value ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <Icon size={18} strokeWidth={2} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </Section>

        {!isInstalled && (isIOS || deferredPrompt) && (
          <Section title="Instalar App">
            <div className="px-4 py-4">
              <p className="text-[13px] text-muted-foreground mb-3 leading-relaxed">
                {isIOS
                  ? 'Instale o app na tela inicial do iPhone para acessar sem precisar do navegador.'
                  : 'Instale o app no seu dispositivo para acesso rápido sem precisar do navegador.'}
              </p>
              <button
                onClick={handleInstall}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-primary text-primary-foreground rounded-[14px] text-[15px] font-semibold active:scale-[0.98] transition-transform"
              >
                <Download size={17} strokeWidth={2.5} />
                {isIOS ? 'Como instalar no iPhone' : 'Instalar App'}
              </button>
            </div>
          </Section>
        )}

        {isInstalled && (
          <Section title="Instalar App">
            <div className="px-4 py-4 flex items-center gap-3">
              <CheckCircle size={18} className="text-green-500 shrink-0" />
              <p className="text-[14px] text-muted-foreground">App já está instalado na tela inicial.</p>
            </div>
          </Section>
        )}

        <Section title="Sobre">
          <Row icon={Info} label="Neves Finance" sublabel="Versão 1.0.0" last rightSlot={<span className="text-[12px] text-muted-foreground">v1.0.0</span>} />
        </Section>

        <Section title="Zona de perigo">
          <Row
            icon={Trash2}
            label="Excluir todos os dados"
            sublabel="Remove todas as suas transações permanentemente"
            onClick={() => setShowDeleteConfirm(true)}
            danger
            last
          />
        </Section>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-[24px] max-w-sm mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[17px] font-bold tracking-[-0.3px]">Excluir todos os dados?</AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] text-muted-foreground leading-relaxed">
              Esta ação é permanente e não pode ser desfeita. Todas as suas transações serão excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-[14px] flex-1">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllData}
              className="rounded-[14px] flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir dados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showIOSGuide && <IOSInstallGuide onClose={() => setShowIOSGuide(false)} />}

    </div>
  );
}