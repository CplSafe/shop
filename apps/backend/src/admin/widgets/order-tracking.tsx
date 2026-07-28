import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types";
import {
  Container,
  Heading,
  Button,
  Select,
  Textarea,
  Text,
  Badge,
  toast,
} from "@medusajs/ui";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const STAGE_CODES = [
  "processing",
  "dispatched",
  "customs",
  "out_for_delivery",
  "delivered",
] as const;

type TrackingEvent = { stage: string; note?: string; at: string };
type Tracking = { current: string; history: TrackingEvent[] };

/**
 * Admin widget injected on the order detail page.
 * Lets staff set the current logistics stage and add an optional note; the
 * change is persisted to order metadata via /admin/orders/:id/tracking.
 * Labels follow the admin's active language (see src/admin/i18n/).
 */
const OrderTrackingWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const orderId = data.id;
  const { t } = useTranslation();
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const [stage, setStage] = useState<string>("processing");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch(`/admin/orders/${orderId}/tracking`, {
      credentials: "include",
    });
    if (res.ok) {
      const json = await res.json();
      if (json.tracking) {
        setTracking(json.tracking);
        setStage(json.tracking.current);
      }
    }
  };

  useEffect(() => {
    load();
  }, [orderId]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/admin/orders/${orderId}/tracking`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage, note: note || undefined }),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setTracking(json.tracking);
      setNote("");
      toast.success(t("shopTracking.updated"));
    } catch (e) {
      toast.error(t("shopTracking.updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  const labelFor = (code: string) =>
    STAGE_CODES.includes(code as (typeof STAGE_CODES)[number])
      ? t(`shopTracking.stages.${code}`)
      : code;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{t("shopTracking.title")}</Heading>
        {tracking && <Badge color="green">{labelFor(tracking.current)}</Badge>}
      </div>

      <div className="flex flex-col gap-3 px-6 py-4">
        <Select value={stage} onValueChange={setStage}>
          <Select.Trigger>
            <Select.Value placeholder={t("shopTracking.selectStage")} />
          </Select.Trigger>
          <Select.Content>
            {STAGE_CODES.map((code) => (
              <Select.Item key={code} value={code}>
                {labelFor(code)}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <Textarea
          placeholder={t("shopTracking.notePlaceholder")}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex justify-end">
          <Button onClick={save} isLoading={saving} size="small">
            {t("shopTracking.updateStage")}
          </Button>
        </div>
      </div>

      {tracking && tracking.history.length > 0 && (
        <div className="px-6 py-4">
          <Text size="small" weight="plus" className="mb-2">
            {t("shopTracking.history")}
          </Text>
          <ul className="flex flex-col gap-2">
            {[...tracking.history].reverse().map((ev, i) => (
              <li key={i} className="flex items-start justify-between gap-3">
                <div>
                  <Text size="small">{labelFor(ev.stage)}</Text>
                  {ev.note && (
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {ev.note}
                    </Text>
                  )}
                </div>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {new Date(ev.at).toLocaleString()}
                </Text>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
});

export default OrderTrackingWidget;
