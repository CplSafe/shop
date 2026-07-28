import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Buildings } from "@medusajs/icons";
import {
  Container,
  Heading,
  Button,
  StatusBadge,
  Table,
  Text,
  toast,
  usePrompt,
} from "@medusajs/ui";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type Application = {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string;
  phone: string | null;
  expected_volume: string | null;
  note: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

const STATUS_COLOR: Record<
  Application["status"],
  "green" | "red" | "orange"
> = {
  approved: "green",
  rejected: "red",
  pending: "orange",
};

const WholesaleApplicationsPage = () => {
  const { t } = useTranslation();
  const prompt = usePrompt();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/admin/wholesale-applications", {
      credentials: "include",
    });
    if (res.ok) {
      const json = await res.json();
      setApps(json.applications ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const decide = async (
    app: Application,
    action: "approve" | "reject",
  ) => {
    const confirmed = await prompt({
      title:
        action === "approve"
          ? t("shopWholesale.confirmApproveTitle")
          : t("shopWholesale.confirmRejectTitle"),
      description:
        action === "approve"
          ? t("shopWholesale.confirmApproveBody", { company: app.company_name })
          : t("shopWholesale.confirmRejectBody", { company: app.company_name }),
      confirmText:
        action === "approve"
          ? t("shopWholesale.approve")
          : t("shopWholesale.reject"),
      cancelText: t("shopWholesale.cancel"),
    });
    if (!confirmed) return;

    setBusy(app.id);
    try {
      const res = await fetch(
        `/admin/wholesale-applications/${app.id}/${action}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!res.ok) throw new Error(await res.text());
      toast.success(t("shopWholesale.updated"));
      await load();
    } catch {
      toast.error(t("shopWholesale.updateFailed"));
    } finally {
      setBusy(null);
    }
  };

  const statusLabel = (s: Application["status"]) =>
    t(`shopWholesale.status.${s}`);

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">{t("shopWholesale.title")}</Heading>
        <Button size="small" variant="secondary" onClick={load}>
          {t("shopWholesale.refresh")}
        </Button>
      </div>

      {loading ? (
        <div className="px-6 py-8">
          <Text className="text-ui-fg-subtle">{t("shopWholesale.loading")}</Text>
        </div>
      ) : apps.length === 0 ? (
        <div className="px-6 py-8">
          <Text className="text-ui-fg-subtle">{t("shopWholesale.empty")}</Text>
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{t("shopWholesale.company")}</Table.HeaderCell>
              <Table.HeaderCell>{t("shopWholesale.email")}</Table.HeaderCell>
              <Table.HeaderCell>{t("shopWholesale.phone")}</Table.HeaderCell>
              <Table.HeaderCell>{t("shopWholesale.volume")}</Table.HeaderCell>
              <Table.HeaderCell>{t("shopWholesale.statusCol")}</Table.HeaderCell>
              <Table.HeaderCell className="text-right">
                {t("shopWholesale.actions")}
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {apps.map((a) => (
              <Table.Row key={a.id}>
                <Table.Cell>
                  <div className="flex flex-col">
                    <span className="font-medium">{a.company_name}</span>
                    {a.contact_name && (
                      <span className="text-ui-fg-subtle text-xs">
                        {a.contact_name}
                      </span>
                    )}
                    {a.note && (
                      <span className="text-ui-fg-subtle text-xs mt-1">
                        {a.note}
                      </span>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>{a.email}</Table.Cell>
                <Table.Cell>{a.phone ?? "—"}</Table.Cell>
                <Table.Cell>{a.expected_volume ?? "—"}</Table.Cell>
                <Table.Cell>
                  <StatusBadge color={STATUS_COLOR[a.status]}>
                    {statusLabel(a.status)}
                  </StatusBadge>
                </Table.Cell>
                <Table.Cell>
                  {a.status === "pending" ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="small"
                        variant="secondary"
                        isLoading={busy === a.id}
                        onClick={() => decide(a, "approve")}
                      >
                        {t("shopWholesale.approve")}
                      </Button>
                      <Button
                        size="small"
                        variant="danger"
                        isLoading={busy === a.id}
                        onClick={() => decide(a, "reject")}
                      >
                        {t("shopWholesale.reject")}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <Button
                        size="small"
                        variant="transparent"
                        isLoading={busy === a.id}
                        onClick={() =>
                          decide(
                            a,
                            a.status === "approved" ? "reject" : "approve",
                          )
                        }
                      >
                        {a.status === "approved"
                          ? t("shopWholesale.revoke")
                          : t("shopWholesale.approve")}
                      </Button>
                    </div>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Wholesale",
  icon: Buildings,
});

export default WholesaleApplicationsPage;
