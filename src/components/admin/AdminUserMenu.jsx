"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Settings,
  LogOut,
  Moon,
  Sun,
  User as UserIcon,
  Camera,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { CldUploadWidget } from "next-cloudinary";

export function AdminUserMenu({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef(null);

  // Initialize theme
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  // Handle outside click for dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleTheme() {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <div className="relative hidden md:block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl bg-navy-900 px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-mechanic-500"
      >
        {user?.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt="Admin"
            width={18}
            height={18}
            className="rounded-full object-cover"
          />
        ) : (
          <ShieldCheck size={16} />
        )}
        <span>Admin</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-navy-800/10 bg-white p-2 shadow-xl z-50">
          <div className="px-3 py-2 border-b border-navy-800/10 mb-2">
            <p className="text-xs font-bold text-navy-900 truncate">
              {user?.fullName}
            </p>
            <p className="text-[10px] text-navy-800/60 truncate">
              {user?.email}
            </p>
          </div>

          <Link
            href="/admin"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-navy-800 transition-colors hover:bg-offwhite-100 hover:text-mechanic-500"
            onClick={() => setIsOpen(false)}
          >
            <ShieldCheck size={14} /> Dashboard Admin
          </Link>

          <button
            onClick={() => {
              setIsOpen(false);
              setIsProfileModalOpen(true);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-navy-800 transition-colors hover:bg-offwhite-100 hover:text-mechanic-500"
          >
            <UserIcon size={14} /> Mon Profil
          </button>

          <Link
            href="/admin/parametres"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-navy-800 transition-colors hover:bg-offwhite-100 hover:text-mechanic-500"
            onClick={() => setIsOpen(false)}
          >
            <Settings size={14} /> Paramètres Globaux
          </Link>

          <button
            onClick={toggleTheme}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-navy-800 transition-colors hover:bg-offwhite-100 hover:text-mechanic-500"
          >
            <span className="flex items-center gap-2">
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
              Mode {isDarkMode ? "Clair" : "Sombre"}
            </span>
            <div
              className={`h-4 w-7 rounded-full p-0.5 transition-colors ${
                isDarkMode ? "bg-mechanic-500" : "bg-navy-800/20"
              }`}
            >
              <div
                className={`h-3 w-3 rounded-full bg-white transition-transform ${
                  isDarkMode ? "translate-x-3" : "translate-x-0"
                }`}
              />
            </div>
          </button>
        </div>
      )}

      {/* MODAL PROFIL */}
      {isProfileModalOpen && (
        <ProfileModal
          user={user}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </div>
  );
}

function ProfileModal({ user, onClose }) {
  const [isSaving, setIsSaving] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatarUrl || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUploadSuccess = (result) => {
    if (result.event === "success") {
      setAvatar(result.info.secure_url);
      toast.success("Image téléchargée, n'oubliez pas d'enregistrer.");
    }
  };

  const handleSave = async () => {
    if (password && password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarUrl: avatar,
          ...(password && { password }),
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur serveur");
      }

      toast.success("Profil mis à jour avec succès");
      onClose(); // Fermeture immédiate sans reload
      // Optionnel : On peut faire un router.refresh() si on a importé useRouter, 
      // pour que le SSR refetch le layout (qui contient l'avatar)
      setTimeout(() => {
        window.location.reload();
      }, 500); 
    } catch (err) {
      toast.error("Impossible de mettre à jour le profil");
    } finally {
      setIsSaving(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-navy-900/60 backdrop-blur-md transition-opacity" 
        onClick={!isSaving ? onClose : undefined}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-navy-900/5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* En-tête */}
        <div className="bg-slate-50/80 px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Paramètres du profil
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personnalisez votre compte administrateur
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <UserIcon size={18} className="opacity-0 hidden" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-8 flex flex-col items-center justify-center gap-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg bg-slate-100 ring-1 ring-slate-200">
              {avatar ? (
                <Image
                  src={avatar}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-300">
                  <UserIcon size={40} />
                </div>
              )}
            </div>
            
            <CldUploadWidget
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "eid_gn_products"}
              options={{
                sources: ["local", "url", "camera"],
                multiple: false,
                maxFiles: 1,
              }}
              onSuccess={handleUploadSuccess}
            >
              {({ open }) => (
                <button
                  onClick={() => open()}
                  className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-200 hover:text-slate-900 ring-1 ring-slate-200/50"
                >
                  <Camera size={14} /> Changer la photo
                </button>
              )}
            </CldUploadWidget>
          </div>

          <div className="space-y-4 rounded-2xl bg-slate-50/50 p-5 ring-1 ring-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Sécurité
            </h3>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Laisser vide pour ne pas changer"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-mechanic-500 focus:ring-2 focus:ring-mechanic-500/20"
              />
            </div>
            {password && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retapez votre nouveau mot de passe"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-mechanic-500 focus:ring-2 focus:ring-mechanic-500/20"
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-slate-50/80 px-6 py-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 rounded-xl bg-white border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-mechanic-500 py-2.5 text-sm font-bold text-white shadow-md shadow-mechanic-500/20 transition-all hover:bg-mechanic-600 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
