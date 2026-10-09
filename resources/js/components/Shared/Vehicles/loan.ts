export const LOAN_DEFAULTS = { downPercent: 20, months: 60, annualRate: 12 };

export const TERM_OPTIONS = [12, 24, 36, 48, 60];

export const monthlyPayment = (price: number, downPercent = LOAN_DEFAULTS.downPercent, months = LOAN_DEFAULTS.months, annualRate = LOAN_DEFAULTS.annualRate) => {
    const principal = Math.max(price - (price * downPercent) / 100, 0);
    const rate = annualRate / 100 / 12;
    if (principal <= 0 || months <= 0) return 0;
    if (rate === 0) return principal / months;
    return (principal * rate) / (1 - Math.pow(1 + rate, -months));
};

export const peso = (value: number) => `₱${Math.round(value || 0).toLocaleString("en-PH")}`;

export const inspectionColor = (score?: number | null) => (score == null ? "gray" : score >= 85 ? "green" : score >= 65 ? "yellow" : "red");
