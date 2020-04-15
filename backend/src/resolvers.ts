import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {
  Context,
  UserInput,
  ItemInput,
  Pagination,
  ItemConnection,
} from './types'

export default {
  Query: {
    async items(
      _: any,
      { limit = 4, offset }: Pagination,
      { prisma }: Context,
    ) {
      console.log({ offset, limit })
      const allItems = await prisma.item.findMany()
      allItems.reverse()

      const total = allItems.length
      const items = allItems.slice(offset, limit)
      const hasMore = allItems.length > offset + limit

      return {
        total,
        hasMore,
        items,
      }

      // return {
      //   items,
      //   cursor: items.length ? items[items.length - 1].cursor : null,
      //   // if the cursor of the end of the paginated results is the same as the
      //   // last item in _all_ results, then there are no more results after this
      //   hasMore: items.length
      //     ? items[items.length - 1].id !== allItems[allItems.length - 1].id
      //     : false,
      // }
    },
    async item(_: any, { id }: { id: string }, { prisma }: Context) {
      return prisma.item.findOne({ where: { id } })
    },
    user(_: any, __: null, { req, prisma, user }: Context) {
      if (user) {
        return user
      }
      return null
    },
    users(_: any, __: null, { prisma }: Context) {
      return prisma.user.findMany()
    },
  },
  Mutation: {
    async createItem(_: any, args: ItemInput, { prisma, user }: Context) {
      if (!user) {
        throw new Error('You must be logged in to do that!')
      }
      const item = await prisma.item.create({
        data: {
          ...args,
          user: {
            connect: { id: user.id },
          },
        },
      })
      return item
    },
    async updateItem(_: any, args: ItemInput, { prisma }: Context) {
      // first take a copy of the updates
      const updates = { ...args }
      // remove the ID from the updates
      delete updates.id
      // run the update method
      return prisma.item.update({
        data: updates,
        where: { id: args.id },
      })
    },
    async deleteItem(
      _: any,
      { id }: { id: string },
      { prisma, user }: Context,
    ) {
      const where = { id }
      // 1. find the item
      const item = await prisma.item.findOne({ where })
      // 2. Check if they own that item, or have the permissions
      // const ownsItem = item.user.id === user.id
      // const hasPermissions = user.permissions.some((permission) =>
      //   ['ADMIN', 'ITEMDELETE'].includes(permission),
      // )

      // if (!ownsItem && !hasPermissions) {
      //   throw new Error("You don't have permission to do that!")
      // }

      // 3. Delete it!
      return prisma.item.delete({ where })
    },
    async signup(
      _: any,
      { email, password, name }: UserInput,
      { res, prisma }: Context,
    ) {
      const user = await prisma.user.create({
        data: {
          email: email.toLocaleLowerCase(),
          name,
          password: await bcrypt.hash(password, 10),
        },
      })
      const token = jwt.sign(
        { userId: user.id },
        process.env.APP_SECRET as string,
      )
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
      })
      return user
    },
    async signin(
      _: any,
      { email, password }: UserInput,
      { res, prisma }: Context,
    ) {
      // 1. check if there is a user with that email
      const user = await prisma.user.findOne({ where: { email } })
      if (!user) {
        throw new Error(`No such user found for email ${email}`)
      }
      // 2. Check if their password is correct
      const valid = await bcrypt.compare(password, user.password)
      if (!valid) {
        throw new Error('Invalid Password!')
      }
      // 3. generate the JWT Token
      const token = jwt.sign(
        { userId: user.id },
        process.env.APP_SECRET as string,
      )
      // 4. Set the cookie with the token
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365,
      })
      // 5. Return the user
      return user
    },
    signout(_: never, __: never, { res }: Context) {
      res.clearCookie('token')
      return null
    },
  },
}
