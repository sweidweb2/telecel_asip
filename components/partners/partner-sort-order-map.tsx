"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getPartnerSortOrderPageBounds,
  getPartnerSortOrderPageCount,
  getPartnerSortOrderPageForValue,
  planSortOrderDisplacement,
} from "@/lib/partners/sort-order";
import type { PartnerSortOrderOccupant } from "@/types/partner";
import {
  PARTNER_SORT_ORDER_MAX,
  PARTNER_SORT_ORDER_MIN,
  PARTNER_SORT_ORDER_PAGE_SIZE,
} from "@/validations/partner";

type PartnerSortOrderMapProps = {
  partners: PartnerSortOrderOccupant[];
  currentPartnerId?: string;
  value: number;
  onChange: (order: number) => void;
  disabled?: boolean;
};

export function PartnerSortOrderMap({
  partners,
  currentPartnerId,
  value,
  onChange,
  disabled,
}: PartnerSortOrderMapProps) {
  const pageCount = getPartnerSortOrderPageCount();
  const [page, setPage] = useState(() => getPartnerSortOrderPageForValue(value));

  useEffect(() => {
    setPage(getPartnerSortOrderPageForValue(value));
  }, [value]);

  const others = useMemo(
    () =>
      currentPartnerId
        ? partners.filter((partner) => partner.id !== currentPartnerId)
        : partners,
    [partners, currentPartnerId],
  );

  const byOrder = useMemo(() => {
    const map = new Map<number, PartnerSortOrderOccupant>();
    for (const partner of others) {
      if (!map.has(partner.sort_order)) {
        map.set(partner.sort_order, partner);
      }
    }
    return map;
  }, [others]);

  const { start, end } = useMemo(
    () => getPartnerSortOrderPageBounds(page),
    [page],
  );

  const slots = useMemo(() => {
    const list: number[] = [];
    for (let order = start; order <= end; order += 1) {
      list.push(order);
    }
    return list;
  }, [start, end]);

  const displacement = useMemo(
    () =>
      planSortOrderDisplacement({
        desiredOrder: value,
        currentPartnerId,
        partners,
      }),
    [value, currentPartnerId, partners],
  );

  const takenOnPage = slots.filter((order) => byOrder.has(order)).length;

  return (
    <Accordion className="rounded-lg border bg-muted/30 px-3">
      <AccordionItem value="display-order-map" className="border-none">
        <AccordionTrigger className="min-h-11 py-3 hover:no-underline">
          <span className="flex min-w-0 flex-col items-start gap-0.5 pr-2 text-left">
            <span className="text-sm font-medium">Display order map</span>
            <span className="text-xs font-normal text-muted-foreground">
              Selected {value} · {PARTNER_SORT_ORDER_MIN}–{PARTNER_SORT_ORDER_MAX}{" "}
              · expand to pick a slot
            </span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="pb-3">
          <div className="grid gap-3 border-t pt-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="min-w-0 text-xs text-muted-foreground">
                Showing {start}–{end} (page {page} of {pageCount}
                {takenOnPage > 0 ? ` · ${takenOnPage} taken` : ""}). Taken slots
                are marked; free slots are grey.
              </p>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="min-h-9 min-w-9"
                  disabled={disabled || page <= 1}
                  aria-label="Previous order page"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeftIcon className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="min-h-9 min-w-9"
                  disabled={disabled || page >= pageCount}
                  aria-label="Next order page"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                >
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {slots.map((order) => {
                const occupant = byOrder.get(order);
                const isTaken = Boolean(occupant);
                const isSelected = order === value;

                return (
                  <button
                    key={order}
                    type="button"
                    disabled={disabled}
                    title={
                      occupant
                        ? `${order} · ${occupant.name} (taken — moves on save)`
                        : `${order} · available`
                    }
                    aria-pressed={isSelected}
                    onClick={() => onChange(order)}
                    className={cn(
                      "inline-flex min-h-9 min-w-9 items-center justify-center rounded-md px-2 text-xs font-medium transition-colors",
                      "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      "disabled:pointer-events-none disabled:opacity-50",
                      isSelected &&
                        "bg-primary text-primary-foreground ring-2 ring-primary/40",
                      !isSelected &&
                        isTaken &&
                        "bg-foreground text-background hover:bg-foreground/90",
                      !isSelected &&
                        !isTaken &&
                        "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    {order}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3 text-[0.6875rem] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-primary" /> Selected
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-foreground" /> Taken
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-muted ring-1 ring-border" />{" "}
                Free
              </span>
              <span className="text-muted-foreground/80">
                {PARTNER_SORT_ORDER_PAGE_SIZE} per page
              </span>
            </div>

            {displacement ? (
              <p className="text-xs text-muted-foreground">
                Order {value} is used by{" "}
                <span className="font-medium text-foreground">
                  {displacement.displace.name}
                </span>
                . On save they move to order{" "}
                <span className="font-medium text-foreground">
                  {displacement.displace.toOrder}
                </span>
                .
              </p>
            ) : null}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
