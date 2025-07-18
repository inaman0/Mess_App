import React from 'react'
import CreateSick_meal from '../../components/Resource/CreateSick_meal'
import './SickMeal.css'
import ReadSick_meal from '../../components/Resource/ReadSick_meal'


const Sickmeal = () => {
  return (
    <>
    <h1 className="title">Sick Meal</h1>
      <div className="uploader-wrapper">
          <CreateSick_meal />
      </div>
    </>
  )
}

export default Sickmeal
