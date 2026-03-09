import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { Plus, Trash2, ExternalLink, Cloud, CheckCircle2, Circle, Clock, Archive, Save } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface KanbanPageProps {
  currentUser: any;
}

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-slate-100 text-slate-600' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-indigo-50 text-indigo-600' },
  { id: 'done', label: 'Selesai', color: 'bg-emerald-50 text-emerald-600' },
  { id: 'archived', label: 'Arsip', color: 'bg-amber-50 text-amber-600' },
];

const SortableTask = ({ task, onDelete, onArchive }: { task: Task; onDelete: (id: string) => any; onArchive: (task: Task) => any; key?: any }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group mb-3 cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-slate-800 text-sm">{task.title}</h4>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.status !== 'archived' && (
            <button 
              onClick={(e) => { e.stopPropagation(); onArchive(task); }}
              className="p-1 text-amber-500 hover:bg-amber-50 rounded"
              title="Arsipkan ke Google Drive"
            >
              <Cloud size={14} />
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            className="p-1 text-rose-500 hover:bg-rose-50 rounded"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
        <span className="text-[10px] text-slate-400 font-mono">
          {new Date(task.createdAt).toLocaleDateString('id-ID')}
        </span>
        {task.driveFileLink && (
          <a 
            href={task.driveFileLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] text-indigo-500 flex items-center gap-1 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={10} /> Drive
          </a>
        )}
      </div>
    </div>
  );
};

const KanbanPage: React.FC<KanbanPageProps> = ({ currentUser }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [googleTokens, setGoogleTokens] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTasks();
    const tokens = localStorage.getItem('google_drive_tokens');
    if (tokens) setGoogleTokens(JSON.parse(tokens));

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        setGoogleTokens(event.data.tokens);
        localStorage.setItem('google_drive_tokens', JSON.stringify(event.data.tokens));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    const task: Partial<Task> = {
      title: newTask.title,
      description: newTask.description,
      status: 'todo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      const savedTask = await res.json();
      setTasks([...tasks, savedTask]);
      setNewTask({ title: '', description: '' });
      setIsAdding(false);
    } catch (err) {
      console.error("Failed to add task", err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dropped over a column or another task
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    let newStatus: TaskStatus = activeTask.status;

    // If dropped over a column header
    if (COLUMNS.some(c => c.id === overId)) {
      newStatus = overId as TaskStatus;
    } else {
      // If dropped over another task, get that task's status
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (activeTask.status !== newStatus) {
      const updatedTask = { ...activeTask, status: newStatus, updatedAt: new Date().toISOString() };
      setTasks(tasks.map(t => t.id === activeId ? updatedTask : t));
      
      try {
        await fetch(`/api/tasks/${activeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (err) {
        console.error("Failed to update task status", err);
      }
    } else if (activeId !== overId) {
      // Reorder within the same column
      const oldIndex = tasks.findIndex(t => t.id === activeId);
      const newIndex = tasks.findIndex(t => t.id === overId);
      setTasks(arrayMove(tasks, oldIndex, newIndex));
    }
  };

  const connectGoogleDrive = async () => {
    try {
      const res = await fetch('/api/auth/google/url');
      const { url } = await res.json();
      window.open(url, 'google_auth', 'width=600,height=700');
    } catch (err) {
      console.error("Failed to get auth URL", err);
    }
  };

  const archiveToDrive = async (task: Task) => {
    if (!googleTokens) {
      alert("Silakan hubungkan ke Google Drive terlebih dahulu.");
      return;
    }

    setIsUploading(true);
    try {
      const content = `Tugas: ${task.title}\nDeskripsi: ${task.description}\nStatus: ${task.status}\nDibuat: ${task.createdAt}\nDiarsipkan oleh: ${currentUser?.nama}`;
      const res = await fetch('/api/drive/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokens: googleTokens,
          fileName: `Arsip_Tugas_${task.title.replace(/\s+/g, '_')}.txt`,
          content,
          mimeType: 'text/plain'
        }),
      });

      const data = await res.json();
      if (data.id) {
        const updatedTask: Partial<Task> = {
          status: 'archived',
          driveFileId: data.id,
          driveFileLink: data.webViewLink,
          updatedAt: new Date().toISOString()
        };

        await fetch(`/api/tasks/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask),
        });

        setTasks(tasks.map(t => t.id === task.id ? { ...t, ...updatedTask } : t));
        alert("Tugas berhasil diarsipkan ke Google Drive!");
      }
    } catch (err) {
      console.error("Failed to archive task", err);
      alert("Gagal mengarsipkan tugas.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-800">Manajemen Tugas</h2>
          <p className="text-sm text-slate-500">Kelola tugas harian dan progres kerja Anda</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={connectGoogleDrive}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              googleTokens 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
              : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700'
            }`}
          >
            <Cloud size={18} />
            {googleTokens ? 'Drive Terhubung' : 'Hubungkan Drive'}
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-900 transition-all"
          >
            <Plus size={18} />
            Tugas Baru
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Judul Tugas</label>
                <input 
                  type="text" 
                  required
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Apa yang akan dikerjakan?"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deskripsi</label>
                <input 
                  type="text" 
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Detail singkat..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <Save size={16} />
                Simpan Tugas
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {COLUMNS.map(column => (
            <div key={column.id} className="flex flex-col h-full min-h-[500px]">
              <div className={`flex items-center justify-between p-4 rounded-t-2xl border-b-2 border-white ${column.color}`}>
                <div className="flex items-center gap-2">
                  {column.id === 'todo' && <Circle size={16} />}
                  {column.id === 'in-progress' && <Clock size={16} />}
                  {column.id === 'done' && <CheckCircle2 size={16} />}
                  {column.id === 'archived' && <Archive size={16} />}
                  <h3 className="font-bold text-sm uppercase tracking-wider">{column.label}</h3>
                </div>
                <span className="bg-white/50 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                  {tasks.filter(t => t.status === column.id).length}
                </span>
              </div>
              
              <div className="bg-slate-50/50 p-3 rounded-b-2xl border border-slate-200 border-t-0 flex-1">
                <SortableContext 
                  items={tasks.filter(t => t.status === column.id).map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="min-h-[100px]">
                    {tasks.filter(t => t.status === column.id).map(task => (
                      <SortableTask 
                        key={task.id} 
                        task={task} 
                        onDelete={handleDeleteTask}
                        onArchive={archiveToDrive}
                      />
                    ))}
                    {tasks.filter(t => t.status === column.id).length === 0 && (
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-300">
                        <p className="text-[10px] font-bold uppercase">Kosong</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            </div>
          ))}
        </DndContext>
      </div>

      {isUploading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="font-bold text-slate-800">Mengarsipkan ke Google Drive...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanPage;
