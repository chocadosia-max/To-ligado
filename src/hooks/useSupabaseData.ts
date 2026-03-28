import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Mission } from '../components/Missions';
import { useAuth } from '../contexts/AuthContext';

export interface AppConfig {
  userName: string;
  wifeName: string;
  sarcasmLevel: number;
}

const DEFAULT_CONFIG: AppConfig = {
  userName: 'Soldado',
  wifeName: 'Comandante',
  sarcasmLevel: 50,
};

const INITIAL_MISSIONS = [
  { text: 'Lavar a louça antes de dormir', completed: false, pts: 10 },
  { text: 'Comprar fralda (Tamanho G)', completed: false, pts: 20 },
  { text: 'Elogiar o cabelo novo', completed: true, pts: 50 },
];

export function useSupabaseData() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [lastMedTime, setLastMedTime] = useState<string>('10:45');
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoadingDb(true);
      
      try {
        // 1. O Perfil do Usuário
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (!profile) {
          // Criar perfil inicial
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({ id: user.id, user_name: DEFAULT_CONFIG.userName, wife_name: DEFAULT_CONFIG.wifeName })
            .select()
            .single();
          profile = newProfile;
        }
        
        if (profile) {
          setConfig({
            userName: profile.user_name || DEFAULT_CONFIG.userName,
            wifeName: profile.wife_name || DEFAULT_CONFIG.wifeName,
            sarcasmLevel: profile.sarcasm_level ?? DEFAULT_CONFIG.sarcasmLevel,
          });
        }

        // 2. As Missões
        let { data: missionsData } = await supabase
          .from('missions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at');
          
        if (!missionsData || missionsData.length === 0) {
          // Inserir missões iniciais se não tiver nada
          const seedMissions = INITIAL_MISSIONS.map(m => ({ 
            user_id: user.id, 
            text: m.text, 
            pts: m.pts, 
            is_completed: m.completed 
          }));
          const { data: seeded } = await supabase.from('missions').insert(seedMissions).select();
          missionsData = seeded || [];
        }
        
        if (missionsData) {
          setMissions(missionsData.map(m => ({
            id: m.id, // Supabase retorna UUID (string)
            text: m.text,
            completed: m.is_completed,
            pts: m.pts
          })));
        }

        // Temporário: O Remédio nós guardamos no config ou localStorage por enquanto, 
        // a não ser que criemos tabela. Vamos usar DB local (storage) só para ele se não tiver tabela,
        // mas para simplificar, usaremos estado por sessão, ou localStorage fallback
        const savedMed = localStorage.getItem('tl_last_med');
        if (savedMed) setLastMedTime(JSON.parse(savedMed));

      } catch (err) {
        console.error("Erro ao puxar dados do Supabase:", err);
      }
      
      setLoadingDb(false);
    };

    loadData();
  }, [user]);

  const updateConfig = async (newConfig: AppConfig) => {
    setConfig(newConfig);
    if (!user) return;
    await supabase.from('profiles').update({
      user_name: newConfig.userName,
      wife_name: newConfig.wifeName,
      sarcasm_level: newConfig.sarcasmLevel
    }).eq('id', user.id);
  };

  const toggleMissionDb = async (id: number | string) => {
    const missionToUpdate = missions.find(m => m.id === id);
    if (!missionToUpdate || !user) return;
    
    const newStatus = !missionToUpdate.completed;
    
    // UI Update Optimista
    setMissions(missions.map(m => m.id === id ? { ...m, completed: newStatus } : m));
    
    // DB Update
    await supabase
      .from('missions')
      .update({ is_completed: newStatus })
      .eq('id', id)
      .eq('user_id', user.id);
  };

  const updateLastMedTime = (time: string) => {
    setLastMedTime(time);
    localStorage.setItem('tl_last_med', JSON.stringify(time));
  };

  return { 
    missions, 
    setMissions, 
    config, 
    updateConfig, 
    toggleMissionDb, 
    lastMedTime, 
    updateLastMedTime, 
    loadingDb 
  };
}
