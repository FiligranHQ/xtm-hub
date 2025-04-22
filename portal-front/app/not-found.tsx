import AppContext from '@/components/app-context';
import { ErrorPage } from '@/components/ui/error-page';
import I18nContext from '@/i18n/i18n-context';
import 'filigran-ui/theme.css';
import '../styles/globals.css';

export default function NotFound() {
  return (
    <I18nContext>
      <AppContext>
        <div className="flex flex-col w-full h-screen">
          <ErrorPage>
            <p className="text-center">404 | This page could not be found </p>
          </ErrorPage>
        </div>
      </AppContext>
    </I18nContext>
  );
}
