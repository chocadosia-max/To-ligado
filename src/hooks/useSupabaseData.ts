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

const INITIAL_MISSIONS = [
  { text: 'Lavar a louça antes de dormir', completed: false, pts: 10 },
  { text: 'Comprar fralda (Tamanho G)', completed: false, pts: 20 },
  { text: 'Elogiar o cabelo novo', completed: true, pts: 50 },
];

const INITIAL_TIMELINE = [
  { tag: 'Ela Falou', content: 'Comprar pão na volta do trabalho.', time: '15:30', status: 'pending' },
  { tag: 'Aviso Crítico', content: 'Aniversário da sua mãe é sexta. Não compra panela.', time: 'Ontem', status: 'critical' },
  { tag: 'Missão Cumprida', content: 'Tirar o lixo.', time: '08:00', status: 'done' }
];

const INITIAL_AGENDA = [
  { day: '15', month: 'MAI', title: 'Aniversário da Sogra', status: 'urgente', desc: 'Comprar presente caro. E flores. E não reclame.' },
  { day: '22', month: 'MAI', title: 'Jantar com o Casal Chato', status: 'pendente', desc: 'Você confirmou semana passada. Não finja esquecimento.' },
  { day: '30', month: 'MAI', title: 'Seu Aniversário', status: 'safe', desc: 'Finalmente um dia pra você. Talvez.' }
];

export function useSupabaseData() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [lastMedTime, setLastMedTime] = useState<string>('10:45');
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    // FIX: Se não há usuário logado, desliga o loading e mostra a tela de login
    if (!user) {
      setLoadingDb(false);
      return;
    }

    const loadData = async () => {
      setLoadingDb(true);
      
      try {
        // DISPARO EM PARALELO: Perfil, Missões, Timeline e Agenda ao mesmo tempo
        const [profilePromise, missionsPromise, timelinePromise, agendaPromise] = [
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('missions').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
          supabase.from('timeline').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('agenda').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
        ];

        const [profileRes, missionsRes, timelineRes, agendaRes] = await Promise.all([
          profilePromise, missionsPromise, timelinePromise, agendaPromise
        ]);
        
        // 1. Processar Perfil
        let profile = profileRes.data;
        if (!profile && profileRes.error?.code === 'PGRST116') { // Código para "não encontrado"
          const signupName = user.user_metadata?.full_name || DEFAULT_CONFIG.userName;
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({ 
              id: user.id, 
              user_name: signupName, 
              wife_name: DEFAULT_CONFIG.wifeName,
              wife_phone: DEFAULT_CONFIG.wifePhone,
              user_phone: DEFAULT_CONFIG.userPhone
            })
            .select()
            .single();
          profile = newProfile;
        }
        
        if (profile) {
          setConfig({
            userName: profile.user_name || user.user_metadata?.full_name || DEFAULT_CONFIG.userName,
            wifeName: profile.wife_name || DEFAULT_CONFIG.wifeName,
            wifePhone: profile.wife_phone || DEFAULT_CONFIG.wifePhone,
            userPhone: profile.user_phone || DEFAULT_CONFIG.userPhone,
            sarcasmLevel: profile.sarcasm_level ?? DEFAULT_CONFIG.sarcasmLevel,
          });
        }

        // 2. Processar Missões
        let missionsData = missionsRes.data;
        if (!missionsData || missionsData.length === 0) {
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
            id: m.id,
            text: m.text,
            completed: m.is_completed,
            pts: m.pts
          })));
        }

        // 3. Processar Timeline
        let timelineData = timelineRes.data;
        if (!timelineData || timelineData.length === 0) {
          const seedTimeline = INITIAL_TIMELINE.map(t => ({ 
            user_id: user.id, 
            tag: t.tag, 
            content: t.content, 
            time_display: t.time, 
            status: t.status 
          }));
          const { data: seeded } = await supabase.from('timeline').insert(seedTimeline).select();
          timelineData = seeded || [];
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

        // 4. Processar Agenda
        let agendaData = agendaRes.data;
        if (!agendaData || agendaData.length === 0) {
          const seedAgenda = INITIAL_AGENDA.map(a => ({ 
            user_id: user.id, 
            day: a.day, 
            month: a.month, 
            title: a.title, 
            description: a.desc, 
            status: a.status 
          }));
          const { data: seeded } = await supabase.from('agenda').insert(seedAgenda).select();
          agendaData = seeded || [];
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
      wife_phone: newConfig.wifePhone,
      sarcasm_level: newConfig.sarcasmLevel
    }).eq('id', user.id);
  };

  const toggleMissionDb = async (id: number | string) => {
    const missionToUpdate = missions.find(m => m.id === id);
    if (!missionToUpdate || !user) return;
    
    const newStatus = !missionToUpdate.completed;
    
    setMissions(missions.map(m => m.id === id ? { ...m, completed: newStatus } : m));
    
    if (newStatus) {
      addTimelineEvent('Missão', `Cumpriu: ${missionToUpdate.text}`, 'done');
    }

    await supabase
      .from('missions')
      .update({ is_completed: newStatus })
      .eq('id', id)
      .eq('user_id', user.id);
  };


  const addMission = async (text: string, pts: number) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('missions')
      .insert({ user_id: user.id, text, pts, is_completed: false })
      .select()
      .single();
    
    if (data) {
      setMissions([...missions, { id: data.id, text: data.text, completed: data.is_completed, pts: data.pts }]);
    }
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
    const { data } = await supabase
      .from('timeline')
      .insert({ 
        user_id: user.id, 
        tag, 
        content, 
        time_display: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        status 
      })
      .select()
      .single();
    
    if (data) {
      setTimeline([{ id: data.id, tag: data.tag, content: data.content, time: data.time_display, status: data.status }, ...timeline]);
    }
  };

  const updateLastMedTime = (time: string) => {
    setLastMedTime(time);
    localStorage.setItem('tl_last_med', JSON.stringify(time));
    addTimelineEvent('Saúde', 'Medicamento tomado com sucesso.', 'done');
  };

  return { 
    missions, 
    setMissions, 
    timeline,
    addTimelineEvent,
    agenda,
    config, 
    updateConfig, 
    toggleMissionDb, 
    addMission,
    deleteMission,
    resetAllMissions,
    lastMedTime, 
    updateLastMedTime, 
    loadingDb 
  };
}


