import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import DataTable from '../components/DataTable'
import { showToast } from '../../components/ui/Toast'

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([])

  useEffect(() => {
    adminAPI.getNewsletter().then(data => {
      if (data) setSubscribers(data)
    }).catch((err) => showToast(err?.response?.data?.error || 'Error loading', 'error'))
  }, [])

  const handleDelete = async (item) => {
    if (!confirm('Delete this subscriber?')) return
    try {
      await adminAPI.deleteNewsletter(item.id)
      setSubscribers(subscribers.filter((s) => s.id !== item.id))
      showToast('Subscriber deleted!')
    } catch (err) {
      showToast(err?.response?.data?.error || 'Error deleting subscriber', 'error')
    }
  }

  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'created_at', label: 'Subscribed', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-8">Newsletter Subscribers</h2>
      <DataTable columns={columns} data={subscribers} onEdit={() => {}} onDelete={handleDelete} searchPlaceholder="Search emails..." />
    </div>
  )
}
