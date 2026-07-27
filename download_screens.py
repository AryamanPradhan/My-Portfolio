import os
import urllib.request

screens = [
    {
        "id": "1",
        "title": "Aryaman OS Boot - Variant 1 (Standard Industrial)",
        "image_url": "https://lh3.googleusercontent.com/aida/AP1WRLv0itHzuAtzWFuwmr8vAmbnmrUmwGfVe0ciXgAxir1PXmqyE8OQMO_tQxcCcFVxksfPVE3FQlMcIte6nCrio2SnDjzyvgVowYzZ5223Y-mE1P6gCLx3Dq3X2oD_-kvKeN11Ezz1aUNM8WX1wbe2o2jO-nMf7NZ6hUe5NOboJgrqfU-rpC3uEoDbV0bjtkzOjzAXJ1rw9swhCvL2e-SKusT26yiB12T-Wc6oqzuawfud2zxxrM-AM9-UE_0",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2FjNmUxYTM2Nzk0ZjQ3OWQ4ZDBkNTRkZjA5NmUyMzA1EgsSBxCbwfXn6AsYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjUwNzA5OTMwNzIzOTU5NDQ3MQ&filename=&opi=89354086"
    },
    {
        "id": "2",
        "title": "Aryaman OS - Engineering Workstation",
        "image_url": None,
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2M1YTUyNjQ4NzE1ZDRmZTM5NmRjMmFjNWE2ZGMxZjM0EgsSBxCbwfXn6AsYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjUwNzA5OTMwNzIzOTU5NDQ3MQ&filename=&opi=89354086"
    },
    {
        "id": "3",
        "title": "Operator Profile: ARYAMAN_AI",
        "image_url": "https://lh3.googleusercontent.com/aida/AP1WRLsM-r-l5km9UcChhsA4HYEWydqmiAWqDZAzlIsXG21-LBGGvhrkskJSLqmVe-98DkJBjoccty8BY_08eSIgatClvrC7auEvfXcljQSHQOs0294kSt35VKPfdDufpJ_s7xvC6IKOIUy80rrAx9h8Ns-hC3-tS-IULTDvkyo5NOov8yrItu5yqR3OagdDT0Lvnl3SoxJNByhXyqI3KwZyMXTEK4EUQ7mdMsXumY94iAxupzn8d7udZVQWC20c",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2FhNWYxMjlhMzRjNjQwNWNiNTI4YzM4NGZjNzQ4NzU5EgsSBxCbwfXn6AsYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjUwNzA5OTMwNzIzOTU5NDQ3MQ&filename=&opi=89354086"
    },
    {
        "id": "4",
        "title": "Operator Profile: ARYAMAN_AI (Classified Record)",
        "image_url": "https://lh3.googleusercontent.com/aida/AP1WRLuRuk2F2J-Q6BP_thPTZkFLXSFjhbxbPN-R5PVcLbfUMfc6h2hCR1p45PiOkJz3HghfWwTy0FyoZiNICYgJHcFdE6D4sXzA0FicKrXw4lyaDYpWP-poYi2UqxR_t_D9Lghpf1slrB9xhf6f9pyRm2Osq7YE2Ym7d1990Wnx7dZRydx3t01ysHjMx-glH-oFkYXdi-MZIDl8podWc1_vN6IgGxTPLnjOqnHMSl8fFmGW3BjV5s3GY55J1JGa",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzI4Y2U0MjMyNGEzZTRjOGQ5ZmUxYWFjZjI4MDBhYTFlEgsSBxCbwfXn6AsYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjUwNzA5OTMwNzIzOTU5NDQ3MQ&filename=&opi=89354086"
    },
    {
        "id": "5",
        "title": "Aryaman OS - Systems Explorer (Tactical Rugged Variant)",
        "image_url": "https://lh3.googleusercontent.com/aida/AP1WRLukd-5yiHcoHaO4VBR63Uuu_gaiY48zGqUKCrTUH2r5Rtx2YK9OknD1g3Y611RNm9oLwaSjbKr7_v9GHXeRT5oSwwkHDITiybIeF-MBrt3L5a9HooPJPSyLAcjtF2L8Sutjg_TQ9MLEBVBH7-YM8jmbjGngdhpEmx6q-0CUQYefQZHfRzl8YDIykD3ebMGiljhb1a2baOEgugZDJCCa1Fet4_0wrdeBunxUTiBNaqNs1HOZwJ8_8vRBvyM",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2Y0YTVhNzQ4M2I0ODQxMDVhYmIyNzg0ODRlZTc2YjhiEgsSBxCbwfXn6AsYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjUwNzA5OTMwNzIzOTU5NDQ3MQ&filename=&opi=89354086"
    },
    {
        "id": "6",
        "title": "Aryaman OS - Command Center (Standardized)",
        "image_url": "https://lh3.googleusercontent.com/aida/AP1WRLsAfoa6Lc8uBUIVaBBJRZY-kvUvmt3u5BvgBpt6Bf6ezkdmjCncRJ-Xe01lQfAL29Pw_CGNBUzHKTCj2laOMaQ2xx0OT7orvbLjeG51j-CdXBTx7ZeK3rvJavc08nDZC7BI7k7ax9S9u2JPMGDkjaPUUYrk5sFYE4BhXiZXY2hS_-fwq-R0-K6OB8_902uDKqkwBxY3lLe1kzJ6O4jDXUnbuHtEjmoQ_mR99AEXdtwhpLE6OWSPiCpmMDbC",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2Y2ODcwM2U2Yzg3OTQ2NDc5Y2I3MGUwMzdkYjZhZmJlEgsSBxCbwfXn6AsYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjUwNzA5OTMwNzIzOTU5NDQ3MQ&filename=&opi=89354086"
    },
    {
        "id": "7",
        "title": "Aryaman OS - Systems Explorer (Standardized)",
        "image_url": "https://lh3.googleusercontent.com/aida/AP1WRLtsxKAiaABy-fWyqcq-hE2kAVYSieRbuVC9A38Rn2Yy9o_bI39dtGmMP3JEiHZtvP9Ij2SHIQSGrlqA6BX52gpYsrjT_CSiHaxBAtuRsUdICGEmld7ZCbu3aUwjLcuxUgAq_LfY-dzz8Hug4A4uPl_ONRglSZxpBekp3VzShcAYCkYtYRdv5CtCt2CCxqVXMwgKtdAC2EHAp6i2bY2Yzry747su3RiUandSPbsBkp5i4ufsFDuXMBswzE--",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzg1MDZiODgxNWY4MTQ2ZTZiMDY1OTc5YjFiYzE1MzIzEgsSBxCbwfXn6AsYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjUwNzA5OTMwNzIzOTU5NDQ3MQ&filename=&opi=89354086"
    },
    {
        "id": "8",
        "title": "Operator Profile: ARYAMAN_AI (Standardized)",
        "image_url": "https://lh3.googleusercontent.com/aida/AP1WRLvOko0xUgNVfHPy3qiFJOuDEK8xi6J8re5oqjtZXgW5E6qI25TybufKLuHQta8GuPEU4H1Z7Zamm1Fu4SjpEqXwiu2ZwpKDhLHhVajnvFlfRZ_UqjbT6i89Vgzyz0UAmIxG8LY_zCHC6DzQk_itxVZXdFdz_Cl2N3cq5st7kCkNLvxIph1qduCN2_k_mPNWTNW4UzrIS-Y9C8t6nXDtAfYKP8n8qgvNSPQ6ri3VCR6AJAuJZYUjLD8lAiw",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzIxZWQ2Yzg2OWI5NTQyNDM4OGVmOTNjM2Q4MjhkNzI2EgsSBxCbwfXn6AsYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjUwNzA5OTMwNzIzOTU5NDQ3MQ&filename=&opi=89354086"
    },
    {
        "id": "9",
        "title": "Aryaman OS - Secure Transmission Terminal (Standardized)",
        "image_url": "https://lh3.googleusercontent.com/aida/AP1WRLtDrdFHlQ2iIiX04jAeS4ovV4F0jTgIYOlIdOzNbjVe13Xfgzi5SNZXGZcMGaagNYvFb2TIPYVk6LOt9iNpRFxm_85j3nSEBz3HQRtaLBG2DSiL3OplZsCRxP9h6WecN47H7kjMc5fS-DuD1gcD2zwy5kAMrQiW72lMqFbuULM1X5lUvtQhvTN_LZLrIMzzfLV2IB9ENVYRk31ZjQpnaQtAuhhEoL4Y2_NqgU2tMNy2-nucCKm7NdN0XYDP",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzZmNWZlMTRjMTE3ZTRjODBiZWI2YjlkODY4MTgyMmNhEgsSBxCbwfXn6AsYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjUwNzA5OTMwNzIzOTU5NDQ3MQ&filename=&opi=89354086"
    }
]

def download_file(url, filepath):
    try:
        urllib.request.urlretrieve(url, filepath)
        print(f"Downloaded: {filepath}")
    except Exception as e:
        print(f"Failed to download {url}: {e}")

output_dir = "stitch_screens"
os.makedirs(output_dir, exist_ok=True)

for screen in screens:
    safe_title = screen["title"].replace(" ", "_").replace(":", "").replace("/", "_").replace("(", "").replace(")", "").replace("-", "_")
    base_filename = f"{screen['id']}_{safe_title}"
    
    html_path = os.path.join(output_dir, f"{base_filename}.html")
    print(f"Downloading HTML for {screen['title']}")
    download_file(screen["html_url"], html_path)
    
    if screen["image_url"]:
        img_path = os.path.join(output_dir, f"{base_filename}.png")
        print(f"Downloading Image for {screen['title']}")
        download_file(screen["image_url"], img_path)

print("Download complete.")
