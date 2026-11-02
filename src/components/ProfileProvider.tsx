"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { calculateNutrition } from "@/lib/nutrition";
import type { MealPlan, NutritionResult, Profile, WeightEntry } from "@/lib/types";

const KEYS = {
  profile: "mydietician:profile:v1",
  weights: "mydietician:weights:v1",
  mealPlan: "mydietician:meal-plan:v1",
} as const;

interface ProfileContextValue {
  hydrated: boolean;
  profile: Profile | null;
  nutrition: NutritionResult | null;
  weights: WeightEntry[];
  mealPlan: MealPlan | null;
  saveProfile: (profile: Profile) => void;
  addWeight: (entry: WeightEntry) => void;
  removeWeight: (date: string) => void;
  setMealPlan: (plan: MealPlan | null) => void;
  resetAll: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private mode) – the app still works for the session.
  }
}

const today = () => new Date().toISOString().slice(0, 10);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [mealPlan, setMealPlanState] = useState<MealPlan | null>(null);

  useEffect(() => {
    setProfile(read<Profile>(KEYS.profile));
    setWeights(read<WeightEntry[]>(KEYS.weights) ?? []);
    setMealPlanState(read<MealPlan>(KEYS.mealPlan));
    setHydrated(true);
  }, []);

  const updateWeights = useCallback((updater: (prev: WeightEntry[]) => WeightEntry[]) => {
    setWeights((prev) => {
      const next = updater(prev).sort((a, b) => a.date.localeCompare(b.date));
      write(KEYS.weights, next);
      return next;
    });
  }, []);

  const addWeight = useCallback(
    (entry: WeightEntry) => updateWeights((prev) => [...prev.filter((e) => e.date !== entry.date), entry]),
    [updateWeights],
  );

  const removeWeight = useCallback(
    (date: string) => updateWeights((prev) => prev.filter((e) => e.date !== date)),
    [updateWeights],
  );

  const setMealPlan = useCallback((plan: MealPlan | null) => {
    setMealPlanState(plan);
    write(KEYS.mealPlan, plan);
  }, []);

  const saveProfile = useCallback(
    (next: Profile) => {
      // Diet-relevant changes invalidate the stored meal plan.
      if (
        profile &&
        (profile.diet !== next.diet ||
          profile.mealsPerDay !== next.mealsPerDay ||
          calculateNutrition(profile).calories !== calculateNutrition(next).calories)
      ) {
        setMealPlan(null);
      }
      setProfile(next);
      write(KEYS.profile, next);
      updateWeights((prev) => {
        const last = prev[prev.length - 1];
        if (last?.weight === next.weight) return prev;
        return [...prev.filter((e) => e.date !== today()), { date: today(), weight: next.weight }];
      });
    },
    [profile, setMealPlan, updateWeights],
  );

  const resetAll = useCallback(() => {
    setProfile(null);
    setWeights([]);
    setMealPlanState(null);
    Object.values(KEYS).forEach((k) => write(k, null));
  }, []);

  const nutrition = useMemo(() => (profile ? calculateNutrition(profile) : null), [profile]);

  const value = useMemo<ProfileContextValue>(
    () => ({
      hydrated,
      profile,
      nutrition,
      weights,
      mealPlan,
      saveProfile,
      addWeight,
      removeWeight,
      setMealPlan,
      resetAll,
    }),
    [hydrated, profile, nutrition, weights, mealPlan, saveProfile, addWeight, removeWeight, setMealPlan, resetAll],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
