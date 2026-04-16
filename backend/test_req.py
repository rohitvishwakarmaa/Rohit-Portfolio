import requests

headers = {
    "Origin": "https://rohit-portfolio-hfl2lk8tj-rohitvishwakarmaas-projects.vercel.app",
    "Content-Type": "application/json"
}

data = {
    "email": "rohitvishwakarmaarv@gmail.com"
}

r = requests.post("https://rohit-portfolio-baxj.onrender.com/api/v1/auth/forgot-password", headers=headers, json=data)
print(r.status_code)
print(r.text)
