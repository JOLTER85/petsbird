import * as React from 'react';
import { ErrorInfo } from 'react';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/Button';

const ErrorUI = ({ onRefresh }: { onRefresh: () => void }) => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-200">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('somethingWentWrong')}</h2>
        <p className="text-slate-500 mb-8">{t('unexpectedError')}</p>
        <Button variant="primary" className="w-full" onClick={onRefresh}>
          {t('refreshPage')}
        </Button>
      </div>
    </div>
  );
};

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <ErrorUI onRefresh={() => window.location.reload()} />;
    }

    return (this as any).props.children;
  }
}
