
class FilteringFeatures{
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr
    }



    search() {
        const excludeFields = ['sort', 'page', 'limit', 'fields', 'search'];
        const queryObj = { ...this.queryStr };

        excludeFields.forEach((el) => {
            delete queryObj[el];
        });

        let queryString = JSON.stringify(queryObj);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        const queryObjs = JSON.parse(queryString);

        if (this.queryStr.search) {
            const search = this.queryStr.search;
            queryObjs.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { product: { $regex: search, $options: 'i' } },
                {'previousDetails.name':{ $regex: search, $options: 'i' }},
                {'updatedBy.email':{ $regex: search, $options: 'i' }}
                

            ];
            delete queryObjs.search; // Remove keyword from query object
        }

        // Handle active status
        if (this.queryStr.active !== undefined) {
            queryObjs.active = this.queryStr.active === 'true'; // Convert to boolean
        }

        this.query = this.query.find(queryObjs);
        return this;
    }

    // Other methods...

    
    sort(){
        if(this.queryStr.sort){
            const sortBy=this.queryStr.sort.split(',').join('')
            this.query=this.query.sort(sortBy)
        }else{
            this.query = this.query.sort('-createdAt')
        }

        return this;
    }

    limitFields(){
        if(this.queryStr.fields){
            const fields=this.queryStr.fields.split(',').join('')
            this.query=this.query.select(fields)
        }else{
            this.query=this.query.select('-__v')
        }

        return this;
    }

    paginate(){
        const page= this.queryStr.page * 1 || 1
        const limit = this.queryStr.limit *1 || 100
        //PAGE 1 : 1-10; PAGE 2:11-20; PAGE 3:21-30
        const skip= (page-1) *limit
        this.query=this.query.skip(skip).limit(limit)
        
        return this;
    }

}

module.exports=FilteringFeatures