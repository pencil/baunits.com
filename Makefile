.PHONY: clean
clean:
	rm -rf out

out:
	NODE_ENV=production npm run build

.PHONY: build
build: clean out

.PHONY: deploy/production
deploy/production: out
	aws s3 sync out/_next s3://baunits.com/_next \
		--size-only \
	 	--metadata-directive REPLACE \
		--cache-control max-age=31536000,public,immutable,stale-while-revalidate=31536000,stale-if-error=31536000
	aws s3 sync out s3://baunits.com \
		--metadata-directive REPLACE \
		--cache-control max-age=31536000,public,immutable,stale-while-revalidate=31536000,stale-if-error=31536000 \
		--exclude '*' \
		--include '/*.png' \
		--include '/*.ico'
	aws s3 sync out s3://baunits.com \
		--metadata-directive REPLACE \
		--cache-control max-age=300,public,must-revalidate \
		--exclude '*' \
		--include '*.html' \
		--include '*.txt'

