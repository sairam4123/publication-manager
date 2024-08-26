import { useEffect, useState, useRef } from 'react'
import {FileContext} from './contexts/FileContext'
import './index.css'
import FrontPage from './pages/FrontPage'
import ResultPage from './pages/ResultPage'
import LoadingPage from './pages/LoadingPage'
import { API_SERVER } from './config/config'
import ErrorPage from './pages/ErrorPage'

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState<string | null>(null)
  const isFirst = useRef(true)

  useEffect(() => {
    if (!file && isFirst.current === false) {
      alert("No file selected")
      return
    }
    if (isFirst.current) {
      isFirst.current = false
      console.log("Ignoring alert...")
    }
    const newBody = new FormData()
      newBody.append("file", file as File)
      setLoading(true);
      fetch(`${API_SERVER}/tasks`, {method: 'POST', body: newBody}).then((res) => {
        if (res.ok) {
          setLoading(false)
          res.json().then((data) => {
            setData(data)
          })
        }}).catch((err) => {
          console.log(err)
          setError(err)
        }).finally(() => {
          setLoading(false)})
  }, [file])

  if (loading) {
    return <LoadingPage message='Loading...' />
  }
  if (error) {
    return <ErrorPage error={error} />
  }
  if (data) {
    return <FileContext.Provider value={{file, setFile, taskId: data["task_id"]}}>
      <ResultPage />
    </FileContext.Provider>
  }

  return (
    <FileContext.Provider value={{file, setFile, taskId: null}}>
      <FrontPage />
    </FileContext.Provider>
    
  )
}

export default App
