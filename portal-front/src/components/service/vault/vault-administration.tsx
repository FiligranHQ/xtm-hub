'use client'
import {useTranslations} from "next-intl";
import {VaultForm} from "@/components/service/vault/vault-form";


export const VaultAdministration = () => {
    const t = useTranslations();
    return <><h1>{t('Service.Vault.VaultTitle')}</h1>
        <VaultForm/>
    </>
}

export default VaultAdministration;