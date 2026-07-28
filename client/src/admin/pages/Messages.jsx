import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import DataTable from '../components/DataTable'
import { showToast } from '../../components/ui/Toast'

export default function AdminMessages() {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    adminAPI.getMessages().then(data => {
      if (data) setMessages(data)
    }).catch((err) => showToast(err?.response?.data?.error || 'Error loading', 'error'))
  }, [])

  const handleDelete = async (item) => {
    if (!confirm('Delete this message?')) return
    try {
      await adminAPI.deleteMessage(item.id)
      setMessages(messages.filter((m) => m.id !== item.id))
      showToast('Message deleted!')
    } catch (err) {
      showToast(err?.response?.data?.error || 'Error deleting message', 'error')
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'subject', label: 'Subject' },
    { key: 'message', label: 'Message', render: (v) => v?.substring(0, 50) + '...' },
    { key: 'created_at', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-8">Messages</h2>
      <DataTable columns={columns} data={messages} onEdit={() => {}} onDelete={handleDelete} searchPlaceholder="Search messages..." />
    </div>
  )
}
