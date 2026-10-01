ecospark-server/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                  # seeds admin user + default categories
│   └── migrations/
├── src/
│   ├── app.ts                   # express app, middlewares, routes
│   ├── server.ts                # starts the server
│   ├── config/
│   │   ├── index.ts             # reads .env (PORT, JWT_SECRET, DB URL, gateway keys)
│   │   └── prisma.ts            # Prisma client instance
│   ├── middlewares/
│   │   ├── auth.ts              # verifies JWT
│   │   ├── role.ts              # RBAC (ADMIN / MEMBER)
│   │   ├── validateRequest.ts   # Zod validation
│   │   ├── globalErrorHandler.ts
│   │   └── notFound.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.validation.ts
│   │   ├── user/                # profile, admin member management
│   │   ├── category/
│   │   ├── idea/                # CRUD, draft, submit, approve/reject, search/filter/sort
│   │   ├── vote/
│   │   ├── comment/             # nested comments
│   │   ├── payment/             # initiate, callback/webhook, history
│   │   ├── newsletter/
│   │   ├── watchlist/           # optional
│   │   └── stats/               # admin dashboard stats
│   │   # each module has: routes, controller, service, validation
│   ├── routes/
│   │   └── index.ts             # mounts all module routes under /api/v1
│   ├── utils/
│   │   ├── ApiError.ts
│   │   ├── catchAsync.ts
│   │   ├── sendResponse.ts
│   │   ├── jwt.ts
│   │   ├── hash.ts              # bcrypt helpers
│   │   └── pagination.ts
│   ├── types/
│   │   └── express.d.ts         # adds req.user typing
│   └── constants/
│       └── index.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md