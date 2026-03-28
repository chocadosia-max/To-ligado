import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Mission } from '../components/Missions';
import { useAuth } from '../contexts/AuthContext';

export interface AppConfig {
  userName: string;
  wifeName: string;
  wifePhone: string;
  userPhone: string;
  sarcasmLevel: number;
}

export interface SettingsProps {
  config: {
    userName: string;
    wifeName: string;
    wifePhone: string;
    userPhone: string;
    sarcasmLevel: number;
  };
  onSave: (newConfig: any) => void;
  onReset: () => void;
  onSimulateWebhook?: (msg: string) => void;
}

export interface TimelineEvent {
  id: number | string;
  tag: string;
  content: string;
  time: string;
  status: 'pending' | 'critical' | 'done';
}

export interface AgendaItem {
  id: number | string;
  day: string;
  month: string;
  title: string;
  desc: string;
  status: 'urgente' | 'pendente' | 'safe';
}

const DEFAULT_CONFIG: AppConfig = {
  userName: 'Soldado',
  wifeName: 'Comandante',
  wifePhone: '',
  userPhone: '',
  sarcasmLevel: 50,
};


export function useSupabaseData() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [lastMedTime, setLastMedTime] = useState<string>('10:45');
  const [loadingDb, setLoadingDb] = useState(true);

  const loadData = async () => {
    if (!user) return;
    setLoadingDb(true);
    
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const { data: missionsRes } = await supabase.from('missions').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
      const { data: timelineRes } = await supabase.from('timeline').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      const { data: agendaRes } = await supabase.from('agenda').select('*').eq('user_id', user.id).order('created_at', { ascending: true });

      if (profile) {
        setConfig({
          userName: profile.user_name || user.user_metadata?.full_name || DEFAULT_CONFIG.userName,
          wifeName: profile.wife_name || DEFAULT_CONFIG.wifeName,
          wifePhone: profile.wife_phone || DEFAULT_CONFIG.wifePhone,
          userPhone: profile.user_phone || DEFAULT_CONFIG.userPhone,
          sarcasmLevel: profile.sarcasm_level ?? DEFAULT_CONFIG.sarcasmLevel,
        });
      } else {
        // Fallback: carrega do localStorage se Supabase não retornou dados
        const saved = localStorage.getItem('tl_config');
        if (saved) {
          try {
            setConfig(JSON.parse(saved));
          } catch { /* ignora parse error */ }
        }
      }

      // 2. Processar Missões
      let missionsData = missionsRes;
      if (!missionsData || missionsData.length === 0) {
        const seedMissions = [
          { text: 'Lavar a louça antes de dormir', pts: 10, is_completed: false },
          { text: 'Comprar fralda (Tamanho G)', pts: 20, is_completed: false },
          { text: 'Elogiar o cabelo novo', pts: 50, is_completed: true },
        ].map(m => ({ ...m, user_id: user.id }));
        const { data: seeded } = await supabase.from('missions').insert(seedMissions).select();
        missionsData = seeded || [];
      }
      
      // 3. Processar Timeline
      let timelineData = timelineRes;
      if (!timelineData || timelineData.length === 0) {
        const seedTimeline = [
          { tag: 'Ela Falou', content: 'Comprar pão na volta do trabalho.', time_display: '15:30', status: 'pending' },
          { tag: 'Aviso Crítico', content: 'Aniversário da sua mãe é sexta.', time_display: 'Ontem', status: 'critical' },
          { tag: 'Missão Cumprida', content: 'Tirar o lixo.', time_display: '08:00', status: 'done' }
        ].map(t => ({ ...t, user_id: user.id }));
        const { data: seeded } = await supabase.from('timeline').insert(seedTimeline).select();
        timelineData = seeded || [];
      }
      
      // 4. Processar Agenda
      let agendaData = agendaRes;
      if (!agendaData || agendaData.length === 0) {
        const seedAgenda = [
          { day: '15', month: 'MAI', title: 'Aniversário da Sogra', status: 'urgente', description: 'Comprar presente caro.' },
          { day: '22', month: 'MAI', title: 'Jantar com o Casal Chato', status: 'pendente', description: 'Confirmado.' },
          { day: '30', month: 'MAI', title: 'Seu Aniversário', status: 'safe', description: 'Talvez.' }
        ].map(a => ({ ...a, user_id: user.id }));
        const { data: seeded } = await supabase.from('agenda').insert(seedAgenda).select();
        agendaData = seeded || [];
      }

      if (missionsData) {
        setMissions(missionsData.map(m => ({
          id: m.id,
          text: m.text,
          completed: m.is_completed,
          pts: m.pts
        })));
      }

      if (timelineData) {
        setTimeline(timelineData.map(t => ({
          id: t.id,
          tag: t.tag,
          content: t.content,
          time: t.time_display,
          status: t.status
        })));
      }

      if (agendaData) {
        setAgenda(agendaData.map(a => ({
          id: a.id,
          day: a.day,
          month: a.month,
          title: a.title,
          desc: a.description,
          status: a.status
        })));
      }

      const savedMed = localStorage.getItem('tl_last_med');
      if (savedMed) setLastMedTime(JSON.parse(savedMed));

    } catch (err) {
      console.error("Erro ao puxar dados do Supabase:", err);
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoadingDb(false);
      return;
    }
    loadData();
  }, [user]);

  const updateConfig = async (newConfig: AppConfig) => {
    setConfig(newConfig);
    // Sempre salva no localStorage como garantia local imediata
    localStorage.setItem('tl_config', JSON.stringify(newConfig));
    if (!user) return;
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      user_name: newConfig.userName,
      wife_name: newConfig.wifeName,
      wife_phone: newConfig.wifePhone,
      user_phone: newConfig.userPhone,
      sarcasm_level: newConfig.sarcasmLevel
    }, { onConflict: 'id' });
    if (error) {
      console.warn('Supabase save failed, data safe in localStorage:', error.message);
    }
  };

  const toggleMissionDb = async (id: number | string) => {
    const missionToUpdate = missions.find(m => m.id === id);
    if (!missionToUpdate || !user) return;
    const newStatus = !missionToUpdate.completed;
    setMissions(missions.map(m => m.id === id ? { ...m, completed: newStatus } : m));
    if (newStatus) addTimelineEvent('Missão', `Cumpriu: ${missionToUpdate.text}`, 'done');
    await supabase.from('missions').update({ is_completed: newStatus }).eq('id', id).eq('user_id', user.id);
  };

  const addMission = async (text: string, pts: number) => {
    if (!user) return;
    const { data, error } = await supabase.from('missions').insert({ user_id: user.id, text, pts, is_completed: false }).select().single();
    if (data) setMissions([...missions, { id: data.id, text: data.text, completed: data.is_completed, pts: data.pts }]);
    return { error };
  };

  const deleteMission = async (id: number | string) => {
    if (!user) return;
    setMissions(missions.filter(m => m.id !== id));
    await supabase.from('missions').delete().eq('id', id).eq('user_id', user.id);
  };

  const resetAllMissions = async () => {
    if (!user) return;
    setMissions(missions.map(m => ({ ...m, completed: false })));
    await supabase.from('missions').update({ is_completed: false }).eq('user_id', user.id);
  };

  const addTimelineEvent = async (tag: string, content: string, status: 'pending' | 'critical' | 'done') => {
    if (!user) return;
    const { data } = await supabase.from('timeline').insert({ user_id: user.id, tag, content, time_display: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status }).select().single();
    if (data) setTimeline([{ id: data.id, tag: data.tag, content: data.content, time: data.time_display, status: data.status }, ...timeline]);
  };

  const updateLastMedTime = (time: string) => {
    setLastMedTime(time);
    localStorage.setItem('tl_last_med', JSON.stringify(time));
    addTimelineEvent('Saúde', 'Medicamento tomado com sucesso.', 'done');
  };

  return { missions, timeline, addTimelineEvent, agenda, config, updateConfig, toggleMissionDb, addMission, deleteMission, resetAllMissions, lastMedTime, updateLastMedTime, loadingDb };
}
