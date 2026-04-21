LOGO_SVG = """
<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="44" height="44" rx="11" fill="#6C3FC5"/>
  <path d="M22 8C22 8 13 15.5 13 22.5C13 27.47 17.03 31.5 22 31.5C26.97 31.5 31 27.47 31 22.5C31 15.5 22 8 22 8Z" fill="#7FD67A"/>
  <path d="M22 14C22 14 18 18 18 22.5C18 24.98 19.79 27 22 27C24.21 27 26 24.98 26 22.5C26 18 22 14 22 14Z" fill="white" fill-opacity="0.88"/>
  <path d="M22 27V34" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M18 34H26" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-opacity="0.45"/>
</svg>
""".strip()


def base_template(title: str, body: str) -> str:
    year = __import__("datetime").datetime.now().year
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>{title}</title>
  <style>
    body{{margin:0;padding:0;background:#f0ebff;font-family:'Segoe UI',Arial,sans-serif;color:#1a1035;}}
    .wrap{{max-width:580px;margin:36px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(108,63,197,.12);}}
    .header{{background:linear-gradient(135deg,#6C3FC5 0%,#4e2d9a 100%);padding:28px 36px;display:flex;align-items:center;gap:14px;}}
    .header-text h1{{margin:0;font-size:20px;font-weight:700;color:#fff;letter-spacing:-.02em;}}
    .header-text p{{margin:3px 0 0;font-size:12px;color:rgba(255,255,255,.6);}}
    .body{{padding:36px;}}
    .body h2{{font-size:22px;font-weight:700;color:#1a1035;margin:0 0 10px;}}
    .body p{{font-size:15px;line-height:1.65;color:#444;margin:0 0 16px;}}
    .btn{{display:inline-block;background:linear-gradient(135deg,#6C3FC5,#5cb857);color:#fff!important;text-decoration:none;padding:13px 30px;border-radius:9px;font-weight:700;font-size:15px;margin:6px 0 20px;}}
    .divider{{height:1px;background:#ede7ff;margin:24px 0;}}
    .small{{font-size:12px;color:#999;line-height:1.6;}}
    .footer{{background:#faf8ff;padding:18px 36px;text-align:center;font-size:12px;color:#888;border-top:1px solid #ede7ff;}}
    .footer a{{color:#6C3FC5;text-decoration:none;}}
    .tag{{display:inline-block;background:#f0ebff;color:#6C3FC5;padding:2px 10px;border-radius:99px;font-size:11px;font-weight:700;margin-bottom:12px;}}
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    {LOGO_SVG}
    <div class="header-text">
      <h1>SmartSeason</h1>
      <p>Field Monitoring System</p>
    </div>
  </div>
  <div class="body">{body}</div>
  <div class="footer">
    &copy; {year} SmartSeason &nbsp;&bull;&nbsp; Westlands, Nairobi, Kenya<br/>
    <a href="mailto:support@smartseason.app">support@smartseason.app</a> &nbsp;&bull;&nbsp; +254 700 000 000
  </div>
</div>
</body>
</html>"""


def welcome_html(name: str) -> str:
    return base_template(f"Welcome, {name}!", f"""
<div class="tag">New Account</div>
<h2>Welcome to SmartSeason, {name}! 🌱</h2>
<p>Your account has been created. We're glad to have you on board.</p>
<p>SmartSeason helps you track crop progress, monitor field health, and coordinate across your entire growing season — all from one place.</p>
<div class="divider"></div>
<p class="small">You'll receive a separate email shortly to verify your address. Check your inbox.</p>
""")


def verify_html(name: str, verify_url: str) -> str:
    return base_template("Verify your email", f"""
<div class="tag">Email Verification</div>
<h2>Please verify your email</h2>
<p>Hi {name}, click the button below to confirm your email address and activate your SmartSeason account.</p>
<a href="{verify_url}" class="btn">Verify Email Address</a>
<div class="divider"></div>
<p class="small">This link expires in <strong>48 hours</strong>. If you didn't create an account, you can safely ignore this email.</p>
<p class="small">Or copy this link into your browser:<br/><a href="{verify_url}" style="color:#6C3FC5;">{verify_url}</a></p>
""")


def reset_html(name: str, reset_url: str) -> str:
    return base_template("Reset your password", f"""
<div class="tag">Password Reset</div>
<h2>Reset your password</h2>
<p>Hi {name}, we received a request to reset your SmartSeason password.</p>
<a href="{reset_url}" class="btn">Reset Password</a>
<div class="divider"></div>
<p class="small">This link expires in <strong>2 hours</strong>. If you didn't request a reset, your password remains unchanged — no action needed.</p>
<p class="small">Or copy this link:<br/><a href="{reset_url}" style="color:#6C3FC5;">{reset_url}</a></p>
""")


def field_alert_html(name: str, field_name: str, message: str) -> str:
    return base_template(f"Field Alert: {field_name}", f"""
<div class="tag">Field Alert</div>
<h2>⚠️ Alert: {field_name}</h2>
<p>Hi {name}, an alert has been raised for one of your fields.</p>
<div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 8px 8px 0;margin:16px 0;">
  {message}
</div>
<p>Log in to SmartSeason to review the field and take action.</p>
<div class="divider"></div>
<p class="small">You're receiving this because you have field alert notifications enabled.</p>
""")
