import React, { useState, useEffect, useCallback, useContext } from 'react'
import axios from 'axios'
import { TbListDetails } from 'react-icons/tb'
import AddProduct from './addProduct'
import { Link } from 'react-router-dom'
import '../../style/products.css'
import { UserPermissionsContext } from '../context/UserPermissionsPage' // Correction de l'import
import { IoMdAdd } from 'react-icons/io'
import { SlBasketLoaded } from 'react-icons/sl'

function DisplayProducts({
  products,
  setProducts,
  addProduct,
  setSelectedProductId
}) {
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const userPermissions = useContext(UserPermissionsContext)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    console.log('User Permissions in DisplayProducts:', userPermissions)
  }, [userPermissions])

  const searchProducts = useCallback(
    async (searchTerm, page = 1) => {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        const config = {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
        const response = await axios.get(
          `http://127.0.0.1:4000/api/search/${searchTerm}?page=${page}&limit=10`,
          config
        )
        setProducts(response.data.products)
        console.log(response.data.products)
        setTotalPages(Math.ceil(response.data.total / 10)) // Use limit parameter here
        setCurrentPage(page) // Update current page
      } catch (err) {
        console.error('Error searching products:', err)
      } finally {
        setLoading(false)
      }
    },
    [setProducts]
  )

  const fetchProducts = useCallback(
    async (page = 1) => {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        const config = {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
        const response = await axios.get(
          `http://127.0.0.1:4000/api/getAllProducts?page=${page}&limit=10`,
          config
        )
        console.log('produit rrrrrrresponse:', response.data.products)

        setProducts(response.data.products)
        setTotalPages(Math.ceil(response.data.total / 10)) // Use limit parameter here
        setCurrentPage(page) // Update current page
      } catch (err) {
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    },
    [setProducts]
  )

  const fetchCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const config = {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      const response = await axios.get(
        'http://127.0.0.1:4000/api/getAllCategories',
        config
      )
      setCategories(response.data.categories)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }, [])

  useEffect(() => {
    if (searchTerm) {
      searchProducts(searchTerm, currentPage)
    } else {
      fetchProducts(currentPage)
    }
    fetchCategories()
  }, [searchTerm, currentPage, searchProducts, fetchProducts, fetchCategories])

  const handleSearchSubmit = event => {
    event.preventDefault()
    searchProducts(searchTerm, currentPage)
  }
  const handleSearchChange = event => {
    setSearchTerm(event.target.value)
  }
  const handleDelete = async id => {
    try {
      const token = localStorage.getItem('token')
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      await axios.delete(
        `http://127.0.0.1:4000/api/deleteProduct/${id}`,
        config
      )
      setProducts(products.filter(product => product.idproduit !== id))
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const role = localStorage.getItem('role')

  const getCategoryName = categoryId => {
    if (!Array.isArray(categories)) {
      console.error('Categories is not an array:', categories)
      return 'N/A'
    }
    const category = categories.find(cat => cat.idcategorie === categoryId)
    return category ? category.nom_categorie : 'N/A'
  }

  const handleAddToBasket = async productId => {
    try {
      const token = localStorage.getItem('token')
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      const response = await axios.post(
        'http://127.0.0.1:4000/api/AddtoCart',
        {
          produitId: productId,
          quantite: 1
        },
        config
      )
      console.log(response.data)
      const { currentCommandeId } = response.data
      localStorage.setItem('currentCommandeId', currentCommandeId)
    } catch (error) {
      console.error('Error adding product to basket:', error)
    }
  }
  const handlePageChange = newPage => {
    if (newPage > 0 && newPage <= totalPages) {
      if (searchTerm) {
        searchProducts(searchTerm, newPage)
      } else {
        fetchProducts(newPage)
      }
    }
  }

  const isAdmin = localStorage.getItem('role') === 'admin'

  const handleUpdate = (product, action) => {
    if (action === 'update') {
      setSelectedProduct(product)
    }
  }
  return (
    <div className=' productsShow m-0 p-0'>
      {role !== 'client' && (
        <AddProduct
          addProduct={addProduct}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          fetchProducts={fetchProducts}
          categories={categories}
          setCategories={setCategories}
          loading={loading}
          setLoading={setLoading}
          products={products}
          setProducts={setProducts}
        />
      )}

      <form onSubmit={handleSearchSubmit} className='d-flex '>
        <input
          type='text'
          placeholder='Search products...'
          value={searchTerm}
          onChange={handleSearchChange}
          className='form-control me-2 searchInput'
        />
      </form>
      <div className='container-fluid d-flex justify-content-end mb-2'>
        {(isAdmin || (userPermissions && userPermissions.addProduit === 1)) && ( // Add parentheses here
          <button
            className='addProductButton mr-2'
            data-bs-toggle='modal'
            data-bs-target='#exampleModal'
            onClick={() => handleUpdate('val', 'ajouter')}
          >
            Ajouter un nouveau produit{' '}
            <IoMdAdd className='mx-1 text-white fs-4'></IoMdAdd>
          </button>
        )}
      </div>
      <div className='contentContainer'>
        {' '}
        {loading ? (
          <p>Loading...</p>
        ) : role !== 'client' ? (
          <table className='table  productsList'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Description</th>
                <th>Category</th>
                <th>Discount</th>
                <th>Photo</th>
                <th>Added Date</th>
                <th>Modified Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((val, key) => (
                <tr key={key}>
                  <td>{val.nom_produit}</td>
                  <td>{val.prix_produit}</td>
                  <td>{val.description_produit}</td>
                  <td>{getCategoryName(val.categorie_idcategorie)}</td>
                  <td>{val.remise_produit}</td>
                  <img
                    src={val.photo_produit}
                    alt='product Photo'
                    style={{ width: '120px', height: '120px' }}
                  />

                  <td>{val.date_ajout_produit}</td>
                  <td>{val.date_modification_produit}</td>
                  <td>
                    {(isAdmin ||
                      (userPermissions &&
                        userPermissions.updateProduit === 1)) && ( // Add parentheses here
                        <button
                          className='btn btn-primary mr-2'
                          data-bs-toggle='modal'
                          data-bs-target='#exampleModal'
                          onClick={() => handleUpdate(val, 'update')}
                        >
                          Update
                        </button>
                      )}

                    {/** concernat  userPermissions.deleteProduit lorsque on mis . pas select de choix de atribut */}

                    {(isAdmin ||
                      (userPermissions &&
                        userPermissions.deleteProduit === 1)) && ( // Add parentheses here
                        <button
                          className='btn btn-danger'
                          onClick={() => handleDelete(val.idproduit)}
                        >
                          Delete
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className='row productsDisplayer'>
            {products.map((product, index) => (
              <div className='productCard p-2' key={index}>
                <img
                  className="card-img-top product-image"
                  src={product.photo_produit || 'default-image.jpg'}
                  alt={product.nom_produit}
                />
                <div className='card-body'>
                  <h5 className='card-title'>{product.nom_produit}</h5>
                  <p className='card-category'>
                    {getCategoryName(product.categorie_idcategorie)}
                  </p>
                  <p className='card-text'>{product.description_produit}</p>
                  <p className='card-price'>${product.prix_produit}</p>
                  <div className='buttonsContainer d-flex'>
                    <button className='btn btn-primary'>
                      <Link
                        to={`/Products/${product.idproduit}`}
                        className='showProductDetails text-white btn-link'
                      >
                        <TbListDetails className='mx-1' /> Show Details
                      </Link>
                    </button>
                    <button
                      className='btn btn-success buyProduct'
                      onClick={() => handleAddToBasket(product.idproduit)}
                    >
                      <SlBasketLoaded className='mx-1'></SlBasketLoaded> Add to basket
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        )}
      </div>

      <nav aria-label='Page navigation'>
        <ul className='pagination'>
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className='page-link'
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
          </li>
          {[...Array(totalPages).keys()].map(page => (
            <li
              key={page + 1}
              className={`page-item ${page + 1 === currentPage ? 'active' : ''
                }`}
            >
              <button
                className='page-link'
                onClick={() => handlePageChange(page + 1)}
              >
                {page + 1}
              </button>
            </li>
          ))}
          <li
            className={`page-item ${currentPage === totalPages ? 'disabled' : ''
              }`}
          >
            <button
              className='page-link'
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default DisplayProducts
