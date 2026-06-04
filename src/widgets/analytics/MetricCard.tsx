import { Card } from "../../shared/ui/card"; // Используй свой путь к Card
import { InfoTooltip } from "../../shared/ui/InfoTooltip/InfoTooltip";

import styles from "./AnalyticsWidget.module.scss";

export const MetricCard = ({ icon: Icon, title, value, subValue, children, tooltip }: any) => (
  <Card className={styles.rectCard}>
    <div className={styles.rectHeader}>
      <Icon size={16} color="#64748b" />
      <span className={styles.rectLabel} style={{ display: 'flex', alignItems: 'center' }}>
        {title}
        {tooltip && <InfoTooltip content={tooltip} />}
      </span>
    </div>
    <div className={styles.rectContent}>
      {value && <span className={styles.bigValue}>{value}</span>}
      {subValue && <span className={styles.subValue}>{subValue}</span>}
      {children}
    </div>
  </Card>
);