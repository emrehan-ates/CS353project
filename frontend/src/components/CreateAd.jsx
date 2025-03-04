import React, { useState } from 'react';
import axios from 'axios';

const CreateAd = () => {
    const [vehicleType, setVehicleType] = useState('car');
    const [make, setMake] = useState('');
    const [year, setYear] = useState('');
    const [mileage, setMileage] = useState('');
    const [price, setPrice] = useState('');
    const [fuelType, setFuelType] = useState('gasoline');
    const [engineDisplacement, setEngineDisplacement] = useState('');
    const [transmission, setTransmission] = useState('manual');
    const [color, setColor] = useState('');
    const [condition, setCondition] = useState('no_damaged');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [model, setModel] = useState('');
    const [extraAttribute, setExtraAttribute] = useState('');
    const [images, setImages] = useState([]);
    const [expertReport, setExpertReport] = useState(null);
    const [sellerId, setSellerId] = useState('1'); // Example seller_id

    const handleFileChange = (e) => setImages(e.target.files);
    const handleExpertReportChange = (e) => setExpertReport(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const adData = {
                seller_id: sellerId,
                title,
                description,
                make,
                year,
                mileage,
                price,
                fuel_type: fuelType,
                engine_displacement: engineDisplacement,
                transmission,
                color,
                condition,
                vehicle_type: vehicleType,
                model
            };

            await axios.post('http://localhost:3000/ads/create', adData, {
                headers: { 'Content-Type': 'application/json' }
            });

            const formData = new FormData();
            formData.append('expert_report', expertReport);
            for (let i = 0; i < images.length; i++) {
                formData.append('images', images[i]);
            }

            await axios.post('http://localhost:3000/ads/upload-images', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Ad created successfully!');
        } catch (error) {
            console.error('❌ Error creating ad:', error.response?.data || error.message);
            alert('Failed to create ad');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
                <h2 className="text-3xl font-bold text-center mb-6">Create New Ad</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title and Vehicle Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title"
                            className="p-2 border rounded-md"
                        />
                        <select
                            value={vehicleType}
                            onChange={(e) => setVehicleType(e.target.value)}
                            className="p-2 border rounded-md"
                        >
                            <option value="car">Car</option>
                            <option value="motorcycle">Motorcycle</option>
                            <option value="van">Van</option>
                        </select>
                    </div>

                    {/* Make, Year, Model */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            value={make}
                            onChange={(e) => setMake(e.target.value)}
                            placeholder="Make"
                            className="p-2 border rounded-md"
                        />
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            placeholder="Year"
                            className="p-2 border rounded-md"
                        />
                        <input
                            type="text"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            placeholder="Model"
                            className="p-2 border rounded-md"
                        />
                    </div>

                    {/* Mileage, Price, Engine */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="number"
                            value={mileage}
                            onChange={(e) => setMileage(e.target.value)}
                            placeholder="Mileage"
                            className="p-2 border rounded-md"
                        />
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Price"
                            className="p-2 border rounded-md"
                        />
                        <input
                            type="number"
                            step="0.1"
                            value={engineDisplacement}
                            onChange={(e) => setEngineDisplacement(e.target.value)}
                            placeholder="Engine Displacement"
                            className="p-2 border rounded-md"
                        />
                    </div>

                    {/* Fuel, Transmission, Condition */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select
                            value={fuelType}
                            onChange={(e) => setFuelType(e.target.value)}
                            className="p-2 border rounded-md"
                        >
                            <option value="gasoline">Gasoline</option>
                            <option value="diesel_fuel">Diesel Fuel</option>
                            <option value="lpg">LPG</option>
                            <option value="electricity">Electricity</option>
                            <option value="hybrid">Hybrid</option>
                        </select>
                        <select
                            value={transmission}
                            onChange={(e) => setTransmission(e.target.value)}
                            className="p-2 border rounded-md"
                        >
                            <option value="manuel">Manual</option>
                            <option value="automatic">Automatic</option>
                            <option value="semi-automatic">Semi-Automatic</option>
                        </select>
                        <select
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                            className="p-2 border rounded-md"
                        >
                            <option value="heavily_damaged">Heavily Damaged</option>
                            <option value="lightly_damaged">Lightly Damaged</option>
                            <option value="no_damaged">No Damage</option>
                        </select>
                    </div>

                    {/* Files */}
                    <input type="file" multiple onChange={handleFileChange} />
                    <input type="file" accept="application/pdf" onChange={handleExpertReportChange} />

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700"
                    >
                        Create Ad
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateAd;
