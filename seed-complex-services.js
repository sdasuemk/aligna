const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const services = [
    {
        name: "Full Body Massage & Spa Treatment",
        category: "Health & Wellness",
        subcategory: "Spa Therapy",
        description: "Experience the ultimate relaxation with our Full Body Massage & Spa Treatment. This 90-minute session includes a deep tissue massage, aromatherapy, and a rejuvenating facial. Our expert therapists use organic oils and premium skincare products to ensure you leave feeling refreshed and revitalized. Perfect for stress relief, muscle tension, and overall well-being. Includes a complimentary herbal tea and foot soak. Please arrive 15 minutes early to change and relax.",
        duration: 90,
        price: 120,
        currency: "USD",
        maxCapacity: 1,
        availability: {
            mon: ["09:00-10:30", "11:00-12:30", "14:00-15:30", "16:00-17:30"],
            fri: ["09:00-10:30", "14:00-15:30"]
        }
    },
    {
        name: "Intensive HIIT Bootcamp",
        category: "Fitness & Training",
        subcategory: "Group Training",
        description: "Join our high-intensity interval training (HIIT) bootcamp designed to push your limits and transform your body. This 60-minute class combines cardio, strength training, and plyometrics to maximize calorie burn and build lean muscle. Suitable for all fitness levels, with modifications provided. Bring a water bottle, a towel, and your determination! Classes are held outdoors in the park, weather permitting. Get ready to sweat!",
        duration: 60,
        price: 25,
        currency: "USD",
        maxCapacity: 15,
        availability: {
            tue: ["06:00-07:00", "07:30-08:30", "18:00-19:00"],
            thu: ["06:00-07:00", "07:30-08:30", "18:00-19:00"],
            sat: ["08:00-09:00", "09:30-10:30"]
        }
    },
    {
        name: "Advanced Calculus Tutoring",
        category: "Education",
        subcategory: "University Math",
        description: "Master complex calculus concepts with personalized one-on-one tutoring. Whether you're struggling with derivatives, integrals, or differential equations, our experienced tutors can help you understand the material and improve your grades. Sessions are tailored to your specific needs and learning style. We provide practice problems, exam preparation strategies, and in-depth explanations of difficult topics. Online or in-person options available.",
        duration: 60,
        price: 50,
        currency: "USD",
        maxCapacity: 1,
        availability: {
            mon: ["16:00-17:00", "17:00-18:00"],
            wed: ["16:00-17:00", "17:00-18:00"],
            fri: ["16:00-17:00"]
        }
    }
];

async function seedServices() {
    try {
        console.log('1. Logging in...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'provider@example.com',
            password: 'password123'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login Successful!');

        console.log('\n2. Creating Services...');

        for (const service of services) {
            try {
                const response = await axios.post(`${API_URL}/services`, service, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log(`✅ Created: ${service.name}`);
            } catch (err) {
                console.error(`❌ Failed to create ${service.name}:`, err.response?.data || err.message);
            }
        }

        console.log('\n✨ Seeding Complete!');

    } catch (error) {
        console.error('❌ Script Failed:', error.response?.data || error.message);
    }
}

seedServices();
