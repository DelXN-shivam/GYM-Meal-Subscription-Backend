# GYM-Meal-Subscription

## Project File Structure : 

Gym-Meal/
├── index.js # Main entry point (DB connection, server startup)
├── routes/
│ ├── index.js # Root router (routes distribution)
│ ├── auth.js # Authentication routes
│ ├── product.js # Product management routes
│ ├── user.js # User management routes
│ ├── subscription.js # User subscription routes
│ └── sampleSubscription.js # Sample subscription templates
├── schema/ # Zod validation Schemas 
├── models/ # MongoDB schemas
├── middlewares/ # Custom middleware
└── utils/ # Main DB file


## Files and Routing
**root path** : /api/v1/index.js

1. **`main index.js`**
--- purpose , start the server , initialize db connection

## Routes
2. **`routes/index.js`** 
--- purpose , handle all the requests to /api/v1 
    forwards reqeusts to respective route handlers 

3. **`routes/user.js`**
--- purpose , user registration and calculate-calories

i) **`/user/register`** :
    **POST method**
    Registers a new user in the system by saving their personal, physical, and dietary details securely in the database.

    | Field        | Type     | Required   | Description                                     |
| ---------------- | -------- | --------   | ----------------------------------------------- |
| `name`           | `string` | ✅        | Full name of the user                           |
| `email`          | `string` | ✅        | Email address (must be unique)                  |
| `password`       | `string` | ✅        | Password (hashed before storing)                |
| `height`         | `number` | ✅        | Height in cm                                    |
| `weight`         | `number` | ✅        | Weight in kg                                    |
| `gender`         | `string` | ✅        | `Male`, `Female`, or `Other`                    |
| `contactNo`      | `string` | ✅        | Phone number                                    |
| `homeAddress`    | `string` | ✅        | Home address                                    |
| `officeAddress`  | `string` | ✅        | Office address                                  |
| `collegeAddress` | `string` | ✅        | College address                                 |
| `activityLevel`  | `string` | ✅        | e.g., `Sedentary`, `Moderate`, `Active`         |
| `fitnessGoal`    | `string` | ✅        | e.g., `Lose Weight`, `Gain Muscle`              |
| `dietPreference` | `string` | ✅        | `Veg`, `Non-Veg`, `Vegan`, etc.                 |
| `allergy`        | `string` | ✅        | List known allergies (comma-separated or array) |

**After Successfull Registration responds with :** 

        {
        "message": "User registered successfully",
        "UserId": "64af1234abcdef1234567890"
        }


ii) **`/user/calculate-calories`** :
    **POST method**
    This endpoint calculates a user's BMR (Basal Metabolic Rate), TDEE (Total Daily Energy Expenditure), recommended daily calories, BMI, and macronutrient breakdown based on their physical details and fitness goal.

| Field           | Type     | Required  | Description                                 |
| --------------- | -------- | --------- | ------------------------------------------- |
| `gender`        | `string` | ✅        | Either `male` or `female`                   |
| `weight`        | `number` | ✅        | In kilograms                                |
| `height`        | `number` | ✅        | In centimeters                              |
| `age`           | `number` | ✅        | In years                                    |
| `activityLevel` | `string` | ✅        | `sedentary`, `moderate`, or `active`        |
| `goal`          | `string` | ✅        | `lose-weight`, `muscle-gain`, or `maintain` |


**computes**
1. BMR using Mifflin-St Jeor Equation.  

2. TDEE by multiplying BMR with an activity multiplier.

3. Adjusted calories based on fitness goal.

4. BMI using standard formula.

5. Macronutrient ratio (protein, carbs, fats) in percentage

**SAMPLE REQUEST**

POST /api/v1/user/calculate-calories
Content-Type: application/json

{
  "gender": "male",
  "weight": 70,
  "height": 175,
  "age": 25,
  "activityLevel": "moderate",
  "goal": "muscle-gain"
}


**SAMPLE RESPONSE**

{
  "bmr": 1698,
  "tdee": 2631,
  "recommendedCalories": 3131,
  "bmi": "22.86",
  "macronutients": {
    "protein": { "percentage": 35 },
    "carbs": { "percentage": 40 },
    "fats": { "percentage": 25 }
  }
}

iii) **`api/v1/auth/login`**
Authenticates a user using their email and password. If credentials are valid, returns a success response with user information.

| Field      | Type     | Required | Description              |
| ---------- | -------- | -------- | ------------------------ |
| `email`    | `string` | ✅        | Registered email address |
| `password` | `string` | ✅        | Account password         |
