import styles from '../CustomizationPage.module.css';

interface CampoProps {
    label: string;
    children: React.ReactNode;
}

export function Campo({ label, children }: CampoProps) {
    return (
        <div className={styles.campo}>
            <label className={styles.label}>{label}</label>
            {children}
        </div>
    );
}