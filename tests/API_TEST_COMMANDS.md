# API Testing Commands for Category System

## Prerequisites
Make sure the server is running on http://localhost:5000

## 1. Test Public Endpoints (No Authentication Required)

### Get All Categories
```bash
curl -X GET http://localhost:5000/api/categories
```

### Get All Jobs (should show category field once jobs are created)
```bash
curl -X GET http://localhost:5000/api/jobs
```

## 2. Login as Superadmin

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"superadmin@example.com\",\"password\":\"admin123\"}" \
  -c cookies.txt
```

## 3. Create Categories (Superadmin Only)

### Create Software Development Category
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{\"name\":\"Software Development\",\"description\":\"Software engineering and development jobs\"}"
```

### Create Marketing Category
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{\"name\":\"Marketing\",\"description\":\"Marketing and advertising positions\"}"
```

### Create Sales Category
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{\"name\":\"Sales\",\"description\":\"Sales and business development roles\"}"
```

### Create HR Category
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{\"name\":\"Human Resources\",\"description\":\"HR and recruitment positions\"}"
```

## 4. View Created Categories

```bash
curl -X GET http://localhost:5000/api/categories
```

## 5. Update a Category (Replace CATEGORY_ID with actual ID)

```bash
curl -X PUT http://localhost:5000/api/categories/CATEGORY_ID \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{\"description\":\"Updated description for software development\"}"
```

## 6. Test Authorization (Should Fail - Try creating category without login)

```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Unauthorized Category\"}"
```

Expected: 401 Unauthorized error

## 7. Create Job with Category (Admin/Superadmin)

Note: Replace COMPANY_ID and CATEGORY_ID with actual IDs

```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{\"title\":\"Senior Full Stack Developer\",\"company\":\"COMPANY_ID\",\"category\":\"CATEGORY_ID\",\"location\":\"Remote\",\"description\":\"Looking for experienced developer\",\"salary\":120000,\"tags\":[\"javascript\",\"react\",\"node\"]}"
```

## 8. Get Jobs by Category (Replace CATEGORY_ID)

```bash
curl -X GET http://localhost:5000/api/jobs/category/CATEGORY_ID
```

## 9. Filter Jobs by Category using Query Parameter

```bash
curl -X GET "http://localhost:5000/api/jobs?category=CATEGORY_ID"
```

## 10. Try to Delete Category with Jobs (Should Fail)

```bash
curl -X DELETE http://localhost:5000/api/categories/CATEGORY_ID \
  -b cookies.txt
```

Expected: Error message if category has associated jobs

## PowerShell Equivalents (Windows)

### Login
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"superadmin@example.com","password":"admin123"}' -SessionVariable session
```

### Create Category
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/categories" -Method POST -ContentType "application/json" -Body '{"name":"Software Development","description":"Software engineering jobs"}' -WebSession $session
```

### Get Categories
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/categories" -Method GET
```
