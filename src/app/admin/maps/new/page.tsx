"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import EventTypeStep from "@/components/admin/wizard/EventTypeStep";
import BasicInfoStep from "@/components/admin/wizard/BasicInfoStep";
import MapCenterStep from "@/components/admin/wizard/MapCenterStep";
import { createMap, updateMapCenter } from "@/lib/actions/maps";
import type { EventType } from "@/lib/types";

type WizardStep = "eventType" | "basicInfo" | "center";

const DEFAULT_CENTER = { lat: 35.681236, lng: 139.767125 };

export default function NewMapWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("eventType");
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mapId, setMapId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      {error && (
        <p className="mb-4 rounded-lg border border-red-600/30 bg-red-600/10 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {step === "eventType" && (
        <EventTypeStep
          onSelect={(type) => {
            setEventType(type);
            setStep("basicInfo");
          }}
        />
      )}

      {step === "basicInfo" && eventType && (
        <BasicInfoStep
          onBack={() => setStep("eventType")}
          onNext={(data) => {
            setError(null);
            startTransition(async () => {
              try {
                const { mapId: newMapId } = await createMap({
                  eventType,
                  title: data.title,
                  description: data.description,
                  eventDateStart: data.eventDateStart,
                  eventDateEnd: data.eventDateEnd,
                });
                setMapId(newMapId);
                setStep("center");
              } catch {
                setError("マップの作成に失敗しました。もう一度お試しください。");
              }
            });
          }}
        />
      )}

      {step === "center" && mapId && (
        <MapCenterStep
          initialLat={DEFAULT_CENTER.lat}
          initialLng={DEFAULT_CENTER.lng}
          pending={pending}
          onBack={() => setStep("basicInfo")}
          onNext={(data) => {
            setError(null);
            startTransition(async () => {
              try {
                await updateMapCenter({
                  mapId,
                  centerLat: data.lat,
                  centerLng: data.lng,
                  basemap: data.basemap,
                  brandColor: data.brandColor,
                });
                router.push(`/admin/maps/${mapId}/edit`);
              } catch {
                setError("設定の保存に失敗しました。もう一度お試しください。");
              }
            });
          }}
        />
      )}
    </div>
  );
}
