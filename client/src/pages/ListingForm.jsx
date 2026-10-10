import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { title: '', description: '', price: 0, category: 'other', condition: 'used', status: 'active' }

export default function ListingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    async function loadListing() {
      try {
        const res = await api.get(`/listings/${id}`)
        const listing = res.data.listing
        setForm({
          title: listing.title,
          price: listing.price,
          category: listing.category,
          condition: listing.condition,
          description: listing.description || '',
          status: listing.status,
        })
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load listing')
      }
    }
    loadListing()
  }, [id])

  function onChange(e) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      if (id) {
        await api.patch(`/listings/${id}`, form)
      } else {
        // Do not send seller - server handles it via token
        const { status, ...createData } = form
        await api.post('/listings', createData)
      }
      nav('/listings')
    } catch (err) {
      setError(err.response?.data?.message || 'An unexpected error occurred')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Listing</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        {error && <div className="text-red-600 text-sm p-2 bg-red-50 border border-red-200 rounded">{error}</div>}

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="w-full p-2 border rounded"
            name="title"
            value={form.title}
            onChange={onChange}
            placeholder="e.g. Calculus textbook"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              className="w-full p-2 border rounded"
              name="price"
              type="number"
              min="0"
              value={form.price}
              onChange={onChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              className="w-full p-2 border rounded"
              name="category"
              value={form.category}
              onChange={onChange}
              required
            >
              <option value="textbooks">Textbooks</option>
              <option value="electronics">Electronics</option>
              <option value="furniture">Furniture</option>
              <option value="clothing">Clothing</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Condition</label>
            <select
              className="w-full p-2 border rounded"
              name="condition"
              value={form.condition}
              onChange={onChange}
              required
            >
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="used">Used</option>
              <option value="worn">Worn</option>
            </select>
          </div>
          {id && (
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full p-2 border rounded"
                name="status"
                value={form.status}
                onChange={onChange}
                required
              >
                <option value="active">Active</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description (optional)</label>
          <textarea
            className="w-full p-2 border rounded"
            name="description"
            value={form.description}
            onChange={onChange}
            rows="3"
          />
        </div>

        <button className="btn w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" type="submit">
          {id ? 'Update Listing' : 'Create Listing'}
        </button>
      </form>
    </div>
  )
}
