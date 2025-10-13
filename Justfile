dev *args:
	concurrently "just frontend" "just backend" {{args}}

frontend *args: 
	cd frontend && pnpm i && pnpm run dev {{args}}

backend *args:
	cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload {{args}}

self *args:
	git remote set-url origin https://github.com/alfardil/thestral.git {{args}}

selfPush *args:
	git remote -v
	git remote set-url origin https://github.com/alfardil/thestral.git
	git push -u origin main

org *args:
	git remote set-url origin https://github.com/Lexor-Strategies/Gitty.git {{args}}

orgPush *args:
	git remote -v
	git remote set-url origin https://github.com/Lexor-Strategies/Gitty.git
	git push -u origin main

migrate *args:
	cd frontend && npx drizzle-kit push {{args}}

migrate-prod *args:
	cd frontend && NODE_ENV=production npx drizzle-kit push {{args}}