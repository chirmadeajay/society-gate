import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, StatusBar, ScrollView
} from 'react-native';

const API_URL = 'https://society-gate-backend-production.up.railway.app';
const STATUS_COLOR = { pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444' };
const STATUS_BG = { pending: '#fef3c7', approved: '#d1fae5', rejected: '#fee2e2' };

export default function App() {
  const [screen, setScreen] = useState('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newFlat, setNewFlat] = useState('');
  const [newPurpose, setNewPurpose] = useState('');

  const login = async () => {
    if (!phone || !password) { Alert.alert('Error', 'Please enter phone and password'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');
      setToken(data.access_token);
      setScreen('dashboard');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitors = async () => {
    try {
      const res = await fetch(`${API_URL}/visitors/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setVisitors(data);
    } catch (err) {
      console.error(err);
    }
  };

  const approve = async (id) => {
    await fetch(`${API_URL}/approve/${id}`, { method: 'POST' });
    fetchVisitors();
    Alert.alert('✅ Approved', 'Visitor has been approved!');
  };

  const reject = async (id) => {
    await fetch(`${API_URL}/reject/${id}`, { method: 'POST' });
    fetchVisitors();
    Alert.alert('❌ Rejected', 'Visitor entry denied.');
  };

  const addVisitor = async () => {
    if (!newName || !newFlat) { Alert.alert('Error', 'Name and Flat are required'); return; }
    try {
      const res = await fetch(`${API_URL}/visitors/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName, flat: newFlat, purpose: newPurpose }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to add visitor');
      setNewName(''); setNewFlat(''); setNewPurpose('');
      setShowAdd(false);
      fetchVisitors();
      Alert.alert('🔔 Visitor Added', `${newName} added successfully!`);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  useEffect(() => {
    if (screen === 'dashboard' && token) {
      fetchVisitors();
      const interval = setInterval(fetchVisitors, 10000);
      return () => clearInterval(interval);
    }
  }, [screen, token]);

  const filtered = filter === 'all' ? visitors : visitors.filter(v => v.status === filter);
  const counts = {
    total: visitors.length,
    pending: visitors.filter(v => v.status === 'pending').length,
    approved: visitors.filter(v => v.status === 'approved').length,
    rejected: visitors.filter(v => v.status === 'rejected').length,
  };

  if (screen === 'login') {
    return (
      <View style={s.loginBg}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <Text style={s.loginTitle}>🏢 Society Gate</Text>
        <Text style={s.loginSub}>AI-Powered Visitor Management</Text>
        <TextInput style={s.input} placeholder="Phone Number" placeholderTextColor="#aaa"
          value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextInput style={s.input} placeholder="Password" placeholderTextColor="#aaa"
          value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={s.loginBtn} onPress={login} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.loginBtnText}>Login →</Text>}
        </TouchableOpacity>
      </View>
    );
  }

  if (showAdd) {
    return (
      <View style={s.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={s.header}>
          <TouchableOpacity onPress={() => setShowAdd(false)}>
            <Text style={s.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Add Visitor</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView style={{ padding: 16 }}>
          <Text style={s.fieldLabel}>Visitor Name *</Text>
          <TextInput style={s.fieldInput} placeholder="e.g. Rahul Sharma"
            value={newName} onChangeText={setNewName} />
          <Text style={s.fieldLabel}>Flat Number *</Text>
          <TextInput style={s.fieldInput} placeholder="e.g. 101"
            value={newFlat} onChangeText={setNewFlat} />
          <Text style={s.fieldLabel}>Purpose of Visit</Text>
          <TextInput style={s.fieldInput} placeholder="e.g. Delivery, Guest"
            value={newPurpose} onChangeText={setNewPurpose} />
          <TouchableOpacity style={s.addBtn} onPress={addVisitor}>
            <Text style={s.addBtnText}>Add Visitor & Notify Resident</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={s.header}>
        <Text style={s.headerTitle}>🏢 Society Gate</Text>
        <TouchableOpacity onPress={() => { setToken(null); setScreen('login'); }}>
          <Text style={s.logoutBtn}>Logout</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.statsRow}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
        {[
          { label: 'Total', value: counts.total, color: '#6366f1', bg: '#eef2ff' },
          { label: 'Pending', value: counts.pending, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Approved', value: counts.approved, color: '#10b981', bg: '#d1fae5' },
          { label: 'Rejected', value: counts.rejected, color: '#ef4444', bg: '#fee2e2' },
        ].map(stat => (
          <View key={stat.label} style={[s.statCard, { backgroundColor: stat.bg }]}>
            <Text style={[s.statNum, { color: stat.color }]}>{stat.value}</Text>
            <Text style={[s.statLabel, { color: stat.color }]}>{stat.label}</Text>
          </View>
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <TouchableOpacity key={f} style={[s.filterTab, filter === f && s.filterTabActive]}
            onPress={() => setFilter(f)}>
            <Text style={[s.filterTabText, filter === f && s.filterTabTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={<Text style={s.empty}>No visitors yet. Add one below!</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardTop}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{item.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.visitorName}>{item.name}</Text>
                <Text style={s.visitorSub}>🏠 {item.flat}</Text>
              </View>
              <View style={[s.badge, { backgroundColor: STATUS_BG[item.status] }]}>
                <Text style={[s.badgeText, { color: STATUS_COLOR[item.status] }]}>{item.status}</Text>
              </View>
            </View>
            {item.purpose ? <Text style={s.purpose}>📋 {item.purpose}</Text> : null}
            {item.status === 'pending' && (
              <View style={s.actionRow}>
                <TouchableOpacity style={s.approveBtn} onPress={() => approve(item.id)}>
                  <Text style={s.approveTxt}>✅ Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.rejectBtn} onPress={() => reject(item.id)}>
                  <Text style={s.rejectTxt}>❌ Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
      <TouchableOpacity style={s.fab} onPress={() => setShowAdd(true)}>
        <Text style={s.fabText}>+ Add Visitor</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  loginBg: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e', padding: 28 },
  loginTitle: { fontSize: 34, fontWeight: '800', color: '#fff', marginBottom: 6 },
  loginSub: { fontSize: 14, color: '#888', marginBottom: 28, textAlign: 'center' },
  input: { width: '100%', padding: 15, borderRadius: 10, backgroundColor: '#16213e', color: '#fff', marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: '#2d2d4e' },
  loginBtn: { width: '100%', padding: 16, backgroundColor: '#4f46e5', borderRadius: 12, alignItems: 'center', marginTop: 4 },
  loginBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 52, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  logoutBtn: { color: '#ef4444', fontWeight: '600', fontSize: 14 },
  backBtn: { color: '#4f46e5', fontWeight: '600', fontSize: 15 },
  statsRow: { maxHeight: 90, marginVertical: 12 },
  statCard: { borderRadius: 12, padding: 14, minWidth: 80, alignItems: 'center' },
  statNum: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  filterRow: { maxHeight: 48, marginBottom: 4 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9' },
  filterTabActive: { backgroundColor: '#4f46e5' },
  filterTabText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  filterTabTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#4f46e5' },
  visitorName: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  visitorSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  purpose: { fontSize: 13, color: '#64748b', marginBottom: 8, marginLeft: 52 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  approveBtn: { flex: 1, backgroundColor: '#d1fae5', padding: 11, borderRadius: 10, alignItems: 'center' },
  approveTxt: { color: '#065f46', fontWeight: '700', fontSize: 14 },
  rejectBtn: { flex: 1, backgroundColor: '#fee2e2', padding: 11, borderRadius: 10, alignItems: 'center' },
  rejectTxt: { color: '#991b1b', fontWeight: '700', fontSize: 14 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 16 },
  fab: { position: 'absolute', bottom: 24, left: 24, right: 24, backgroundColor: '#4f46e5', borderRadius: 14, padding: 16, alignItems: 'center', elevation: 6 },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 6, marginTop: 16 },
  fieldInput: { backgroundColor: '#fff', borderRadius: 10, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#e2e8f0', color: '#1e293b' },
  noticeBox: { backgroundColor: '#eef2ff', borderRadius: 10, padding: 14, marginTop: 20 },
  noticeText: { color: '#4f46e5', fontSize: 13, lineHeight: 20 },
  addBtn: { backgroundColor: '#4f46e5', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
