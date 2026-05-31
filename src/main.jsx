import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import Login from './Login.jsx';
import { supabase } from './supabaseClient.js';
import './index.css';

const SCREEN = { color:'#f0f0ff', background:'#050208', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Barlow, sans-serif' };

function AuthWrapper() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [boot, setBoot] = useState(undefined); // undefined = nog niet geladen

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Na inloggen: profiel, club, teams en sponsoren laden uit Supabase
  useEffect(() => {
    if (!user) { setBoot(undefined); return; }
    let cancelled = false;
    (async () => {
      let profile = null, club = null, teams = [], sponsors = [];
      try {
        const { data: prof } = await supabase.from('user_profiles').select('*').eq('id', user.id).maybeSingle();
        profile = prof || null;
        if (prof && prof.club_id) {
          const [{ data: c }, { data: ts }, { data: sp }] = await Promise.all([
            supabase.from('clubs').select('*').eq('id', prof.club_id).maybeSingle(),
            supabase.from('teams').select('*').eq('club_id', prof.club_id).order('id'),
            supabase.from('sponsors').select('*').eq('club_id', prof.club_id).eq('is_active', true).order('id'),
          ]);
          club = c || null; teams = ts || []; sponsors = sp || [];
        }
      } catch (e) {
        // stil falen: de app draait door met lokale gegevens
      }
      if (!cancelled) setBoot({ user, profile, club, teams, sponsors });
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (loading) return <div style={SCREEN}>Laden...</div>;
  if (!user) return <Login />;
  if (boot === undefined) return <div style={SCREEN}>Gegevens laden...</div>;
  return <App boot={boot} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthWrapper />
  </React.StrictMode>
);

// Service worker registreren — zorgt dat de app zichzelf ververst naar de nieuwste versie.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      // Controleer bij elke start op een nieuwe versie.
      reg.update();
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          // Nieuwe versie geïnstalleerd terwijl de oude nog draaide → herlaad eenmalig.
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            window.location.reload();
          }
        });
      });
    }).catch(() => {});
  });
}
